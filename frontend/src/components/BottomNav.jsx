import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBullhorn, 
  faCalendarAlt, 
  faMicrophone, 
  faUserCircle,
  faPrayingHands,
  faBell,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

export default function BottomNav({ activeTab, setActiveTab, tabs, unreadCount = 0, onNotificationClick, onLogout }) {
  // Mobile navigation should include the most important features + quick actions
  const mobileTabIds = ['home', 'announcements', 'prayer-requests', 'profile'];
  const mobileTabs = tabs.filter(t => mobileTabIds.includes(t.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/95 backdrop-blur-xl border-t border-mdOutline/10 px-4 pb-safe pt-2 flex justify-between items-center shadow-premium">
      {/* Dynamic Tabs */}
      {mobileTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-mdPrimary text-white shadow-md2' : 'text-mdOnSurfaceVariant'}`}>
              <FontAwesomeIcon icon={tab.icon} className="text-lg" />
            </div>
          </button>
        );
      })}

      {/* Notifications Quick Action */}
      <button
        onClick={onNotificationClick}
        className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 relative ${unreadCount > 0 ? 'opacity-100' : 'opacity-40 grayscale hover:opacity-100'}`}
      >
        <div className="w-11 h-11 rounded-2xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdPrimary">
          <FontAwesomeIcon icon={faBell} className="text-lg" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-4 w-4 h-4 bg-mdError text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Logout Quick Action */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:text-mdError"
      >
        <div className="w-11 h-11 rounded-2xl bg-mdError/5 flex items-center justify-center text-mdError">
          <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
        </div>
      </button>
    </nav>
  );
}
