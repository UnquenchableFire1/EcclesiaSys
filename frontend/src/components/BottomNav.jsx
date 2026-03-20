import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBullhorn, 
  faCalendarAlt, 
  faMicrophone, 
  faUserCircle 
} from '@fortawesome/free-solid-svg-icons';

export default function BottomNav({ activeTab, setActiveTab, tabs }) {
  // Only show standard tabs in BottomNav for a clean look
  const mobileTabs = tabs.filter(t => ['home', 'announcements', 'events', 'sermons', 'profile'].includes(t.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/80 dark:bg-mdSurface/80 backdrop-blur-xl border-t border-mdOutline/10 px-6 pb-safe pt-3 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      {mobileTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive ? 'scale-110' : 'opacity-50 grayscale hover:opacity-100'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-mdPrimary text-white shadow-lifted' : 'text-mdOnSurfaceVariant'}`}>
              <FontAwesomeIcon icon={tab.icon} className="text-xl" />
            </div>
            {isActive && (
              <span className="text-[10px] font-black uppercase tracking-widest text-mdPrimary animate-fade-in">
                {tab.label === 'Overview' ? 'Home' : tab.label}
              </span>
            )}
            {!isActive && (
              <div className="absolute -bottom-1 w-1 h-1 bg-mdPrimary rounded-full scale-0 transition-transform group-hover:scale-100"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
