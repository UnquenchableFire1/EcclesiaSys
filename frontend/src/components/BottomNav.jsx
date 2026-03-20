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
  const userType = sessionStorage.getItem('userType');
  const mobileTabIds = ['home', 'members', 'announcements', 'events', 'sermons', 'chat', 'profile'];
    
  const mobileTabs = tabs.filter(t => mobileTabIds.includes(t.id))
    .sort((a, b) => mobileTabIds.indexOf(a.id) - mobileTabIds.indexOf(b.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/95 backdrop-blur-xl border-t border-mdOutline/10 px-2 pb-safe pt-2 flex justify-between items-center shadow-premium overflow-x-auto no-scrollbar">
      {/* Dynamic Module Tabs */}
      <div className="flex flex-1 justify-between items-center min-w-max gap-1 px-2">
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
    </nav>
  );
}
