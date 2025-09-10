
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/StatusCard';
import StreamsView from './components/Dashboard';
import GalleryView from './components/ConfigForm';
import CreateStreamView from './components/LogViewer';
import TroubleshootingView from './components/Troubleshooting';
import { SystemStats, Stream, View, LiveStreamStatus, StreamState } from './app/shared/types';

// This function maps the backend worker state to the UI-friendly status
const mapStateToStatus = (state: StreamState): Stream['status'] => {
  switch (state) {
    case StreamState.RUNNING:
      return 'Live';
    case StreamState.STOPPED:
    case StreamState.IDLE:
      return 'Offline';
    case StreamState.FAILED:
      return 'Error';
    case StreamState.STARTING:
    case StreamState.RESTARTING:
      return 'Scheduled'; // Using 'Scheduled' to represent a transient state
    default:
      return 'Offline';
  }
};

function App() {
  const [activeView, setActiveView] = useState<View>('streams');
  const [liveStatus, setLiveStatus] = useState<LiveStreamStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/stream/status');
        if (response.ok) {
          const data: LiveStreamStatus = await response.json();
          setLiveStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch stream status:", error);
      }
    };

    fetchStatus(); // Initial fetch
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // For now, we only have one stream managed by the backend.
  // We can create a mock stream entry and populate it with live data.
  const streams: Stream[] = liveStatus ? [
    {
      id: '1',
      name: 'Main VPS Stream',
      thumbnailUrl: 'https://source.unsplash.com/random/120x68/?broadcast,server',
      videoInfo: `Bitrate: ${liveStatus.bitrate.toFixed(2)} kbps`,
      platform: 'youtube',
      startDate: liveStatus.state === StreamState.RUNNING ? new Date().toLocaleDateString() : '--',
      schedule: liveStatus.state === StreamState.RESTARTING ? 'Restarting...' : (liveStatus.state === StreamState.STARTING ? 'Starting...' : '--'),
      durationSeconds: liveStatus.uptimeSeconds,
      status: mapStateToStatus(liveStatus.state),
    }
  ] : [];

  // System stats are static for now, can be a future API endpoint
  const MOCK_SYSTEM_STATS: SystemStats = {
    activeStreams: liveStatus?.state === StreamState.RUNNING ? 1 : 0,
    cpuUsage: 0, // Placeholder
    memoryUsage: { used: 0, total: 0 }, // Placeholder
    internetSpeed: { upload: liveStatus?.bitrate || 0, download: 0 }, // Using live bitrate for upload
  };

  const renderView = () => {
    switch(activeView) {
      case 'streams': 
        return <StreamsView stats={MOCK_SYSTEM_STATS} streams={streams} onNewStreamClick={() => setActiveView('new_stream')} />;
      case 'gallery': 
        return <GalleryView />;
      case 'new_stream': 
        return <CreateStreamView onCancel={() => setActiveView('streams')} />;
      case 'history': 
        return <div className="p-8 text-white bg-gray-800 rounded-lg">History view is not implemented in this prototype.</div>;
      case 'troubleshooting':
        return <TroubleshootingView />;
      default: 
        return <StreamsView stats={MOCK_SYSTEM_STATS} streams={streams} onNewStreamClick={() => setActiveView('new_stream')} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-gray-300 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
