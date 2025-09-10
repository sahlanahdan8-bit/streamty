
import React, { useState, useEffect } from 'react';

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
        <input 
            className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props} 
        />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
        <select
            className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            {...props}
        >
            {children}
        </select>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean, setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
  <button
    type="button"
    className={`${enabled ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
    onClick={() => setEnabled(!enabled)}
  >
    <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
  </button>
);


interface CreateStreamViewProps {
    onCancel: () => void;
}

const CreateStreamView: React.FC<CreateStreamViewProps> = ({ onCancel }) => {
    const [videoFiles, setVideoFiles] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [loopVideo, setLoopVideo] = useState(true);
    const [orientation, setOrientation] = useState('landscape');
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch('/api/videos');
                if (response.ok) {
                    const data = await response.json();
                    setVideoFiles(data);
                }
            } catch (error) {
                console.error("Failed to fetch videos:", error);
            }
        };
        fetchVideos();
    }, []);

    const serverTime = new Date().toLocaleString('sv-SE').replace(' ', 'T').slice(0,19);

    return (
        <div className="bg-[#161B22] border border-gray-700/50 rounded-lg">
            <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-xl font-semibold text-white">Create New Stream</h2>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Form */}
                <div className="space-y-5">
                    <SelectField
                        label="Select Video"
                        name="video"
                        value={selectedVideo}
                        onChange={(e) => setSelectedVideo(e.target.value)}
                    >
                        <option value="">-- Select a video for preview --</option>
                        {videoFiles.map(file => (
                            <option key={file} value={file}>{file}</option>
                        ))}
                    </SelectField>
                    <InputField label="Stream Title" name="title" placeholder="Enter stream title..."/>
                    
                    <div>
                        <h3 className="text-md font-semibold text-gray-200 mb-2 mt-4">Stream Configuration</h3>
                        <div className="space-y-4">
                            <InputField label="RTMP URL" name="rtmpUrl" placeholder="rtmp://a.rtmp.youtube.com/live2" />
                            <InputField label="Stream Key" name="streamKey" type="password" placeholder="••••-••••-••••-••••" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-gray-200 mb-2 mt-4">Schedule Settings</h3>
                        <div className="text-xs text-gray-500 mb-3">Server time: {serverTime}</div>
                        <div className="bg-[#0D1117] p-4 rounded-lg border border-gray-700/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-300">Loop Video</label>
                                <ToggleSwitch enabled={loopVideo} setEnabled={setLoopVideo} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="" name="date" type="datetime-local" />
                                <InputField label="" name="duration" type="number" placeholder="Duration (minutes)" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mt-4 mb-2">
                            <h3 className="text-md font-semibold text-gray-200">Advanced Settings</h3>
                            <ToggleSwitch enabled={showAdvancedSettings} setEnabled={setShowAdvancedSettings} />
                        </div>
                        {showAdvancedSettings && (
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField label="Bitrate" name="bitrate"><option>2500 kbps</option><option>4500 kbps</option></SelectField>
                                <SelectField label="Frame Rate" name="framerate"><option>30 FPS</option><option>60 FPS</option></SelectField>
                                <SelectField label="Resolution" name="resolution"><option>720p HD</option><option>1080p HD</option></SelectField>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Orientation</label>
                                    <div className="flex gap-2">
                                         <button type="button" onClick={() => setOrientation('landscape')} className={`flex-1 py-2 rounded-md text-sm ${orientation === 'landscape' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>Landscape</button>
                                         <button type="button" onClick={() => setOrientation('portrait')} className={`flex-1 py-2 rounded-md text-sm ${orientation === 'portrait' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>Portrait</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Side - Preview */}
                <div className="flex flex-col items-center justify-center bg-[#0D1117] rounded-lg border-2 border-dashed border-gray-700 min-h-[300px] lg:min-h-full p-4">
                    {selectedVideo ? (
                        <video
                            key={selectedVideo} // Force re-render when video source changes
                            className="w-full max-w-md aspect-video bg-black rounded-md"
                            controls
                            src={`/api/videos/preview/${encodeURIComponent(selectedVideo)}`}
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a1.5 1.5 0 01.95 1.41V16a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h8.09a1.5 1.5 0 01.95 1.41L15 10z" />
                            </svg>
                             <p className="text-gray-500 mt-4 text-sm">Video preview will appear here</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-b-lg">
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
                  <div className="bg-red-600 h-1.5 rounded-full" style={{width: "80%"}}></div>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="bg-transparent hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-md text-sm">Cancel</button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">Create Stream</button>
                </div>
            </div>
        </div>
    );
};

export default CreateStreamView;