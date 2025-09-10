import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { StreamState, LiveStreamStatus } from '../shared/types'; // Assuming types are in a shared folder

// --- Configuration from Environment Variables ---
// These are absolute paths set in the .env file and loaded by systemd.
const DATA_DIR = process.env.DATA_DIR;
const VIDEO_DIR = process.env.VIDEO_DIR;
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

if (!DATA_DIR || !VIDEO_DIR) {
    throw new Error("FATAL: DATA_DIR or VIDEO_DIR environment variables are not set.");
}

const COMMAND_FILE = path.join(DATA_DIR, 'command.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const FFMPEG_LOG_FILE = path.join(DATA_DIR, 'ffmpeg.log');

const STALL_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RESTART_BACKOFF_MS = 60000; // 1 minute
const STABILITY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
let status: LiveStreamStatus = {
  state: StreamState.IDLE,
  uptimeSeconds: 0,
  bitrate: 0,
  restarts: 0,
  lastProgressTimestamp: 0,
};
let lastCommandTimestamp = 0;
let restartBackoffMs = 5000; // Start with 5 seconds
let stallCheckInterval: ReturnType<typeof setInterval> | null = null;
let uptimeInterval: ReturnType<typeof setInterval> | null = null;
let lastStableTimestamp = 0;

async function writeStatus() {
  try {
    await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('Error writing status file:', error);
  }
}

async function stopStream(signal: 'SIGINT' | 'SIGKILL' = 'SIGINT') {
  if (ffmpegProcess) {
    console.log(`Stopping stream with signal ${signal}...`);
    // Remove listeners to prevent exit handler from triggering a restart
    ffmpegProcess.removeAllListeners('exit');
    ffmpegProcess.kill(signal);
    ffmpegProcess = null;
  }
  status.state = StreamState.STOPPED;
  status.pid = undefined;
  if (stallCheckInterval) clearInterval(stallCheckInterval);
  if (uptimeInterval) clearInterval(uptimeInterval);
  status.uptimeSeconds = 0;
  status.bitrate = 0;
  await writeStatus();
}

async function startStream() {
  if (ffmpegProcess) {
    console.log('Stream is already running.');
    return;
  }

  console.log('Attempting to start stream...');
  status.state = StreamState.STARTING;
  await writeStatus();
  
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8').catch(() => {
        throw new Error('config.json not found. Please configure the stream via the web UI.');
    });
    const config = JSON.parse(configData);
    const { rtmpUrl, streamKey } = config;

    if (!rtmpUrl || !streamKey) {
        throw new Error('RTMP URL or Stream Key is not configured.');
    }

    const videoFiles = await fs.readdir(VIDEO_DIR).catch(() => {
        throw new Error(`Video directory not found at ${VIDEO_DIR}`);
    });

    if (videoFiles.length === 0) {
        throw new Error('No video files found in video directory.');
    }
    const playlistFile = path.join(DATA_DIR, 'playlist.txt');
    const playlistContent = videoFiles.map(f => `file '${path.join(VIDEO_DIR, f)}'`).join('\n');
    await fs.writeFile(playlistFile, playlistContent);

    const fullRtmpUrl = `${rtmpUrl.replace(/\/$/, '')}/${streamKey}`;

    const args = [
      '-hide_banner', '-loglevel', 'info',
      '-re',
      '-f', 'concat', '-safe', '0', '-i', playlistFile,
      '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
      '-r', '30', '-g', '60', '-keyint_min', '60',
      '-b:v', '2500k', '-maxrate', '2800k', '-bufsize', '5000k',
      '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2',
      '-f', 'flv', fullRtmpUrl,
      '-progress', 'pipe:1'
    ];
    
    console.log(`Executing FFmpeg: ${FFMPEG_PATH} ${args.join(' ')}`);
    
    ffmpegProcess = spawn(FFMPEG_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    
    const logStream = (await fs.open(FFMPEG_LOG_FILE, 'a')).createWriteStream();
    ffmpegProcess.stderr.pipe(logStream);

    status.pid = ffmpegProcess.pid;
    status.state = StreamState.RUNNING;
    status.lastProgressTimestamp = Date.now();
    lastStableTimestamp = Date.now();
    status.uptimeSeconds = 0;
    status.lastError = undefined; // Clear previous error on successful start

    uptimeInterval = setInterval(() => {
        status.uptimeSeconds++;
        // Reset backoff after a period of stability
        if (Date.now() - lastStableTimestamp > STABILITY_THRESHOLD_MS) {
            if (restartBackoffMs > 5000) {
                console.log('Stream has been stable. Resetting restart backoff.');
                restartBackoffMs = 5000;
            }
        }
    }, 1000);
    
    ffmpegProcess.stdout.on('data', (data) => {
        const text = data.toString();
        const bitrateMatch = text.match(/bitrate=\s*([\d\.]+)kbits\/s/);
        if (bitrateMatch && bitrateMatch[1]) {
            status.bitrate = parseFloat(bitrateMatch[1]);
        }
        status.lastProgressTimestamp = Date.now();
    });

    ffmpegProcess.on('exit', (code, signal) => {
      console.error(`FFmpeg process exited with code ${code}, signal ${signal}`);
      if (stallCheckInterval) clearInterval(stallCheckInterval);
      if (uptimeInterval) clearInterval(uptimeInterval);
      
      const wasStoppedIntentionally = status.state === StreamState.STOPPED;
      ffmpegProcess = null;
      status.pid = undefined;
      
      if (!wasStoppedIntentionally) {
        status.state = StreamState.RESTARTING;
        status.lastError = `FFmpeg exited with code ${code || 'null'} signal ${signal || 'null'}`;
        status.restarts++;
        console.log(`Restarting in ${restartBackoffMs / 1000}s...`);
        setTimeout(startStream, restartBackoffMs);
        // Increase backoff for next time
        restartBackoffMs = Math.min(restartBackoffMs * 2, MAX_RESTART_BACKOFF_MS);
      }
    });

    stallCheckInterval = setInterval(() => {
        if (Date.now() - status.lastProgressTimestamp > STALL_TIMEOUT_MS) {
            console.error('Stream stalled. No progress received. Killing FFmpeg process.');
            stopStream('SIGKILL'); // Force kill on stall
        }
    }, 10000); // Check every 10 seconds

  } catch (error: any) {
    console.error('Failed to start stream:', error.message);
    status.state = StreamState.FAILED;
    status.lastError = error.message;
    await writeStatus();
  }
}

async function processCommands() {
    try {
        const commandData = await fs.readFile(COMMAND_FILE, 'utf-8');
        const { command, timestamp } = JSON.parse(commandData);

        if (timestamp > lastCommandTimestamp) {
            console.log(`Received command: ${command}`);
            lastCommandTimestamp = timestamp;

            if (command === 'START' && status.state !== StreamState.RUNNING && status.state !== StreamState.STARTING) {
                // Reset backoff immediately on manual start
                restartBackoffMs = 5000;
                await startStream();
            } else if (command === 'STOP' && (status.state === StreamState.RUNNING || status.state === StreamState.STARTING)) {
                await stopStream();
            }
        }
    } catch (error) {
        // File might not exist, which is fine
    }
}


async function main() {
    console.log('Worker process started.');
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(VIDEO_DIR, { recursive: true });

    // Initial status write
    await writeStatus();

    // Main loop
    setInterval(async () => {
        await processCommands();
        await writeStatus();
    }, 2000);
}

main();
