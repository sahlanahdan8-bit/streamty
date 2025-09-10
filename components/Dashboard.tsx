
import React, { useState, useEffect } from 'react';
import { SystemStats, Stream, StreamStatusType } from '../app/shared/types';

// --- ICONS (defined locally to avoid new files) ---
const CPUThermalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const MemoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>);
const WifiIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.555a5.5 5.5 0 017.778 0M12 20.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zm-3.339-3.339a2.75 2.75 0 013.89 0" /></svg>);
const StreamIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>);
const YouTubeIcon = () => (<svg viewBox="0 0 28 20" className="w-6 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.427 3.076A3.504 3.504 0 0024.95 0.62C22.776 0 14 0 14 0S5.224 0 3.05.62A3.504 3.504 0 00.573 3.076C0 5.26 0 10 0 10s0 4.74.573 6.924a3.504 3.504 0 002.477 2.456C5.224 19.998 14 19.998 14 19.998s8.776 0 10.95-.62a3.504 3.504 0 002.477-2.456C28 14.74 28 10 28 10s0-4.74-.573-6.924z" fill="#FF0000"></path><path d="M11.192 14.26V5.738l7.243 4.261-7.243 4.26z" fill="#fff"></path></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);


// --- SUB-COMPONENTS ---
const StatCard: React.FC<{ icon: JSX.Element; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-[#161B22] border border-gray-700/50 rounded-lg p-4 flex items-center">
        <div className="p-3 bg-gray-700/50 rounded-lg mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <div className="text-lg font-semibold text-white">{children}</div>
        </div>
    </div>
);

const statusStyles: Record<StreamStatusType, string> = {
    Live: 'bg-green-500',
    Scheduled: 'bg-yellow-500',
    Stopped: 'bg-gray-500',
    Offline: 'bg-gray-500',
    Error: 'bg-red-500',
};

const handleStart = async () => {
    await fetch('/api/stream/start', { method: 'POST' });
};

const handleStop = async () => {
    await fetch('/api/stream/stop', { method: 'POST' });
};

const StreamTableRow: React.FC<{ stream: Stream }> = ({ stream }) => {
    const formatDuration = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const renderDuration = () => {
        if (stream.status === 'Live') {
            return `Live - ${formatDuration(stream.durationSeconds)}`;
        }
        if (stream.status === 'Offline' && stream.configuredDurationHours) {
            return <div className="flex items-center"><ClockIcon />{stream.configuredDurationHours}h</div>;
        }
        return '—';
    };

    const renderActions = () => {
        if (stream.status === 'Live') {
            return <button onClick={handleStop} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm">Stop</button>;
        }
        if (stream.status === 'Offline' || stream.status === 'Error' || stream.status === 'Stopped') {
            return (
                <div className="flex items-center gap-3">
                    <button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md text-sm">Start</button>
                    <button className="text-gray-400 hover:text-white" aria-label="Edit Stream"><EditIcon /></button>
                    <button className="text-gray-400 hover:text-white" aria-label="Delete Stream"><DeleteIcon /></button>
                </div>
            );
        }
        // For Scheduled/transient states
        return <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded-md text-sm animate-pulse">Working...</button>;
    };

    return (
        <tr className="border-b border-gray-700/50 hover:bg-gray-800/40">
            <td className="p-4 flex items-center">
                <img src={stream.thumbnailUrl} alt={stream.name} className="w-20 h-12 object-cover rounded-md mr-4"/>
                <div>
                    <p className="font-semibold text-white">{stream.name}</p>
                    <p className="text-xs text-gray-400">{stream.videoInfo}</p>
                </div>
            </td>
            <td className="p-4"><div className="flex items-center gap-2"><YouTubeIcon /> YouTube</div></td>
            <td className="p-4">{stream.startDate}</td>
            <td className="p-4 text-center">{stream.schedule || '—'}</td>
            <td className="p-4">{renderDuration()}</td>
            <td className="p-4">
                <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${statusStyles[stream.status]}`}></span>
                    {stream.status}
                </div>
            </td>
            <td className="p-4">
                {renderActions()}
            </td>
        </tr>
    );
};

// --- MAIN COMPONENT (StreamsView) ---
interface StreamsViewProps {
  stats: SystemStats;
  streams: Stream[];
  onNewStreamClick: () => void;
}

const StreamsView: React.FC<StreamsViewProps> = ({ stats, streams, onNewStreamClick }) => {
  return (
    <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<StreamIcon/>} title="Active Streams">{stats.activeStreams}</StatCard>
            <StatCard icon={<CPUThermalIcon />} title="CPU Usage">{stats.cpuUsage.toFixed(1)}%</StatCard>
            <StatCard icon={<MemoryIcon />} title="Memory">
                 {stats.memoryUsage.total > 0 ? `${stats.memoryUsage.used.toFixed(2)} MB / ${(stats.memoryUsage.total / 1024).toFixed(2)} GB` : 'N/A'}
            </StatCard>
            <StatCard icon={<WifiIcon />} title="Upload Speed">
                 <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    {(stats.internetSpeed.upload / 1000).toFixed(2)} Mbps
                </div>
            </StatCard>
        </div>

        {/* Streaming Status Table */}
        <div className="bg-[#161B22] border border-gray-700/50 rounded-lg">
            <div className="p-4 flex justify-between items-center border-b border-gray-700/50">
                <h2 className="text-lg font-semibold text-white">Streaming Status</h2>
                <div className="flex items-center gap-4">
                    <input type="search" placeholder="Search streams..." className="bg-[#0D1117] border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button onClick={onNewStreamClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-md text-sm">+ New Stream</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/30">
                        <tr>
                            <th scope="col" className="p-4">Stream Name</th>
                            <th scope="col" className="p-4">Platform</th>
                            <th scope="col" className="p-4">Start Date</th>
                            <th scope="col" className="p-4 text-center">Schedule</th>
                            <th scope="col" className="p-4">Duration</th>
                            <th scope="col" className="p-4">Status</th>
                            <th scope="col" className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streams.length > 0 ? (
                            streams.map(stream => <StreamTableRow key={stream.id} stream={stream} />)
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center p-8 text-gray-500">
                                    Awaiting status from server...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default StreamsView;