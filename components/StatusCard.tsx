
import React from 'react';
import { View } from '../app/shared/types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Logo = () => (
    <svg className="h-8 w-auto text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30L50 15L80 30V70L50 85L20 70V30Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/>
        <path d="M20 30L50 45L80 30" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/>
        <path d="M50 85V45" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/>
    </svg>
);

const StreamIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>);
const GalleryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TroubleshootingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);


const NavItem: React.FC<{
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center w-full p-3 my-1 rounded-lg text-left transition-colors ${
                isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="w-64 bg-[#161B22] border-r border-gray-700/50 flex-shrink-0 flex flex-col p-4">
      <div className="flex items-center h-16 mb-4">
        <Logo />
         <span className="ml-2 text-xl font-bold text-white">Streamify</span>
      </div>
      <ul className="flex-1">
        <NavItem 
            icon={<StreamIcon />}
            label="Streams"
            isActive={activeView === 'streams'}
            onClick={() => setActiveView('streams')}
        />
        <NavItem 
            icon={<GalleryIcon />}
            label="Gallery"
            isActive={activeView === 'gallery'}
            onClick={() => setActiveView('gallery')}
        />
        <NavItem 
            icon={<HistoryIcon />}
            label="History"
            isActive={activeView === 'history'}
            onClick={() => setActiveView('history')}
        />
        <NavItem 
            icon={<TroubleshootingIcon />}
            label="Troubleshooting"
            isActive={activeView === 'troubleshooting'}
            onClick={() => setActiveView('troubleshooting')}
        />
      </ul>
       <div className="mt-auto">
        {/* Can add user profile or settings here later */}
       </div>
    </nav>
  );
};

export default Sidebar;
