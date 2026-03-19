import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faChevronLeft, 
  faKey,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  tabs, 
  isOpen, 
  setIsOpen, 
  userType, 
  userName, 
  onLogout 
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-[101] 
        bg-white dark:bg-mdSurface 
        border-r border-mdOutline/10
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-72'}
        flex flex-col shadow-premium
      `}>
        {/* Brand/Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-mdOutline/5 bg-mdPrimary">
          <span className="text-2xl font-black tracking-tighter text-white">EcclesiaSys</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white/80 hover:text-white p-2"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-mdPrimaryContainer/20 border-b border-mdOutline/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mdPrimary flex items-center justify-center text-white shadow-md1">
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-mdOnSurface truncate">{userName}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-mdPrimary">{userType === 'admin' ? 'Administrator' : 'Church Member'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-mdPrimary text-white shadow-md2 translate-x-1' 
                  : 'text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant/50 hover:text-mdPrimary'}
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-mdSurfaceVariant/30 group-hover:bg-mdPrimaryContainer'}`}>
                <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? 'text-white' : 'text-mdPrimary'} />
              </div>
              <span className="flex-1 text-left">{tab.label}</span>
            </button>
          ))}

          {/* Change Password Link */}
          <button
            onClick={() => {
              setActiveTab('password');
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`
              w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200
              ${activeTab === 'password' 
                ? 'bg-mdSecondary text-white shadow-md2 translate-x-1' 
                : 'text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant/50 hover:text-mdSecondary'}
            `}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === 'password' ? 'bg-white/20' : 'bg-mdSurfaceVariant/30'}`}>
              <FontAwesomeIcon icon={faKey} className={activeTab === 'password' ? 'text-white' : 'text-mdSecondary'} />
            </div>
            <span className="flex-1 text-left">Change Password</span>
          </button>
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-mdOutline/10 bg-mdSurfaceVariant/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-mdError hover:bg-mdError/10 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-mdError/10 flex items-center justify-center group-hover:bg-mdError group-hover:text-white transition-all">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
