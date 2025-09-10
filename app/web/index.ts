// FIX: To avoid global type conflicts with DOM typings (e.g., for `fetch`),
// we explicitly use `express.Request` and `express.Response` instead of importing `Request` and `Response` directly.
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Mock types for now, will be replaced with shared types
interface Command {
    command: 'START' | 'STOP';
    timestamp: number;
}
interface StreamConfig {
    streamKey: string;
    rtmpUrl: string;
}

const PORT = process.env.PORT || 8080;
// Use environment variable for data directory, ensuring it's an absolute path
const DATA_DIR = process.env.DATA_DIR;
const VIDEO_DIR = process.env.VIDEO_DIR; // Added for video previews
if (!DATA_DIR || !VIDEO_DIR) {
    throw new Error("FATAL: DATA_DIR or VIDEO_DIR environment variable is not set.");
}

const COMMAND_FILE = path.join(DATA_DIR, 'command.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

const app = express();
app.use(cors());
// Fix: Add explicit types to all route handlers to resolve type inference issues with express middleware.
app.use(express.json());

// --- API Endpoints ---

// NEW: Endpoint to get list of available videos
app.get('/api/videos', async (req: express.Request, res: express.Response) => {
    try {
        const files = await fs.readdir(VIDEO_DIR);
        // Filter for common video formats, can be expanded
        const videoFiles = files.filter(file => /\.(mp4|mkv|mov|avi|flv)$/i.test(file));
        res.json(videoFiles);
    } catch (error) {
        console.error('Error reading video directory:', error);
        res.status(500).json({ message: 'Could not list videos.' });
    }
});


// Get current stream status
app.get('/api/stream/status', async (req: express.Request, res: express.Response) => {
    try {
        const statusData = await fs.readFile(STATUS_FILE, 'utf-8');
        res.json(JSON.parse(statusData));
    } catch (error) {
        // If file doesn't exist, return default stopped state
        res.json({ state: 'IDLE', uptimeSeconds: 0, bitrate: 0, restarts: 0 });
    }
});

// Send command to the worker
const sendCommand = async (command: 'START' | 'STOP') => {
    const commandData: Command = { command, timestamp: Date.now() };
    await fs.writeFile(COMMAND_FILE, JSON.stringify(commandData));
};

app.post('/api/stream/start', async (req: express.Request, res: express.Response) => {
    try {
        await sendCommand('START');
        res.status(202).json({ message: 'Stream start command issued.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to issue start command.' });
    }
});

app.post('/api/stream/stop', async (req: express.Request, res: express.Response) => {
    try {
        await sendCommand('STOP');
        res.status(202).json({ message: 'Stream stop command issued.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to issue stop command.' });
    }
});

// Get/Set stream configuration
app.get('/api/stream/config', async (req: express.Request, res: express.Response) => {
     try {
        const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
        res.json(JSON.parse(configData));
    } catch (error) {
        // Return default/empty config
        res.json({ rtmpUrl: process.env.RTMP_URL || 'rtmp://a.rtmp.youtube.com/live2', streamKey: '' });
    }
});

app.post('/api/stream/config', async (req: express.Request, res: express.Response) => {
    try {
        const newConfig: StreamConfig = req.body;
        // Add validation here in a real app
        await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
        res.status(200).json({ message: 'Configuration saved.'});
    // Fix: Corrected a syntax error in the catch block where a stray '.ts' was present.
    } catch (error) {
        res.status(500).json({ message: 'Failed to save configuration.' });
    }
});


// --- Static File Serving ---
// Fix: __dirname is not available in ES modules, so we recreate it using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// In a CommonJS module, __dirname is the directory of the current file.
// Our compiled JS will be in /dist/app/web, so we go up 2 levels to /dist
const distRoot = path.resolve(__dirname, '..', '..');

// NEW: Serve videos for the preview player
// This maps /api/videos/preview/my-video.mp4 to /opt/stream/videos/my-video.mp4
app.use('/api/videos/preview', express.static(VIDEO_DIR));

// Serve the bundled frontend files from the 'public' subdirectory in 'dist'
app.use(express.static(path.join(distRoot, 'public')));

// SPA Fallback: For any route not matched by static assets or API, serve index.html
app.get('*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(distRoot, 'public', 'index.html'));
});


app.listen(PORT, async () => {
    // Ensure data directory exists, as defined by the absolute path from .env
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Also ensure video dir exists, as defined by the absolute path from .env
    await fs.mkdir(VIDEO_DIR, { recursive: true });
    console.log(`Web server listening on port ${PORT}`);
});