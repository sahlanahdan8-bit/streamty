
export type View = 'streams' | 'gallery' | 'history' | 'new_stream' | 'troubleshooting';

export interface SystemStats {
  activeStreams: number;
  cpuUsage: number;
  memoryUsage: {
    used: number; // in MB
    total: number; // in MB
  };
  internetSpeed: {
    upload: number; // in Kbps
    download: number; // in Kbps
  };
}

export type StreamPlatform = 'youtube' | 'twitch' | 'facebook';

export type StreamStatusType = 'Live' | 'Scheduled' | 'Stopped' | 'Error' | 'Offline';

export interface Stream {
  id: string;
  name: string;
  thumbnailUrl: string;
  videoInfo: string;
  platform: StreamPlatform;
  startDate: string;
  schedule?: string;
  durationSeconds: number;
  configuredDurationHours?: number;
  status: StreamStatusType;
}

// --- Types Shared between Web and Worker ---

// This enum represents the actual state of the FFmpeg worker process
export enum StreamState {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  RESTARTING = 'RESTARTING', // In backoff period before next start attempt
  FAILED = 'FAILED',       // A non-recoverable error occurred (e.g., bad config)
  IDLE = 'IDLE',         // Initial state before anything happens
}

// This is the structure of the status.json file, the single source of truth
export interface LiveStreamStatus {
  state: StreamState;
  pid?: number;
  uptimeSeconds: number;
  bitrate: number; // in kbps
  restarts: number;
  lastProgressTimestamp: number;
  lastError?: string;
}


export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  videoSourceType: VideoSourceType;
  singleVideoPath: string;
  staticImagePath: string;
  audioPath: string;
  preset: string;
  videoFiles: string[];
  isScheduled: boolean;
  startTime: string;
  durationHours: number;
}

export enum VideoSourceType {
    SINGLE_FILE = 'SINGLE_FILE',
    PLAYLIST = 'PLAYLIST',
    STATIC_IMAGE = 'STATIC_IMAGE'
}
