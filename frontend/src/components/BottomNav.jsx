import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBullhorn, 
  faCalendarAlt, 
  faMicrophone, 
  faUserCircle,
  faPrayingHands,
  faBell
} from '@fortawesome/free-solid-svg-icons';

export default function BottomNav({ activeTab, setActiveTab, tabs, unreadCount = 0, onNotificationClick }) {
  // Mobile navigation includes all central pillars as per user request
  const mobileTabIds = ['home', 'announcements', 'events', 'sermons', 'prayer-requests', 'profile'];
  const mobileTabs = tabs.filter(t => mobileTabIds.includes(t.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/95 backdrop-blur-xl border-t border-mdOutline/10 px-4 pb-safe pt-2 flex justify-between items-center shadow-premium">
      {/* Dynamic Module Tabs */}
      <div className="flex flex-1 justify-between items-center mr-4">
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-mdPrimary text-white shadow-md2' : 'text-mdOnSurfaceVariant'}`}>
                <FontAwesomeIcon icon={tab.id === 'profile' ? faUserCircle : tab.icon} className="text-lg" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Persistent Notification Action on Mobile */}
      <div className="border-l border-mdOutline/10 pl-4 py-1">
        <button
          onClick={onNotificationClick}
          className={`relative w-11 h-11 rounded-2xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdPrimary transition-all duration-300 ${unreadCount > 0 ? 'opacity-100 ring-2 ring-mdError/20' : 'opacity-50 grayscale hover:opacity-100'}`}
        >
          <FontAwesomeIcon icon={faBell} className="text-lg" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-mdError text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
