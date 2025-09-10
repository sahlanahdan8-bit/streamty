import React from 'react';

const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const DriveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 5.4L12 12l4.29-6.6a.75.75 0 111.22.79L13 14.12V21a.75.75 0 01-1.5 0v-6.88L6.5 6.19a.75.75 0 111.22-.79z" /><path d="M12.75 3a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V3zM4.5 4.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V4.5zM19.5 4.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V4.5z" /></svg>);

const GalleryView: React.FC = () => {
  return (
    <div className="bg-[#161B22] border border-gray-700/50 rounded-lg p-6 min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-semibold text-white">Video Gallery</h2>
            <p className="text-sm text-gray-400">Manage your videos for streaming</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">
            <UploadIcon />
            Upload Video
          </button>
          <button className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md text-sm">
            <DriveIcon />
            Import from Drive
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <input 
          type="search" 
          placeholder="Search videos..." 
          className="flex-grow bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Newest</option>
          <option>Oldest</option>
          <option>A-Z</option>
        </select>
      </div>

      <div className="flex-grow flex items-center justify-center text-center border-2 border-dashed border-gray-700 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-400">No videos yet</h3>
          <p className="text-sm text-gray-500">Upload your first video to get started</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
