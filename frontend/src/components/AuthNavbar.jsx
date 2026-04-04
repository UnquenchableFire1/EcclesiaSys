import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faUserCircle, 
  faBell,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import AssemblyLogo from './AssemblyLogo';

export default function AuthNavbar({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  userName, 
  userType, 
  profilePictureUrl, 
  onLogout,
  unreadCount = 0,
  onNotificationClick
}) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/70 backdrop-blur-2xl border-b border-mdOutline/10 h-20 px-8 flex items-center justify-between shadow-sm">
      {/* Brand & Desktop Tabs */}
      <div className="flex items-center gap-12 flex-1">
        <div 
          className="cursor-pointer group hover:opacity-80 transition-all transition-transform active:scale-95" 
          onClick={() => setActiveTab('home')}
        >
          <AssemblyLogo size={38} showText={true} />
        </div>

        {/* Horizontal Navigation Items */}
        <div className="hidden lg:flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300
                  ${isActive 
                    ? 'bg-mdPrimary text-white shadow-lifted scale-105' 
                    : 'text-mdOnSurfaceVariant hover:bg-mdPrimary/5 hover:text-mdPrimary'}
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Hub */}
      <div className="flex items-center gap-6">
        {/* User Profile Hub Button */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-mdSurfaceVariant/40 hover:bg-mdPrimary/10 transition-all group relative border border-mdOutline/10"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:rotate-6">
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-mdPrimary/10 text-mdPrimary">
                  <FontAwesomeIcon icon={faUserCircle} />
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-black text-mdOnSurface leading-none mb-0.5 max-w-[120px] truncate">{userName}</p>
              <p className="text-[8px] font-black text-mdPrimary uppercase tracking-widest">{userType}</p>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] text-mdOnSurfaceVariant transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-mdError text-white text-[9px] font-black rounded-lg flex items-center justify-center border-2 border-white animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Hub Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfileMenu(false)}></div>
              <div className="absolute top-16 right-0 w-64 bg-white rounded-[2.5rem] shadow-premium border border-mdOutline/10 p-5 animate-scale-in origin-top-right">
                <div className="px-4 py-2 mb-4 border-b border-mdOutline/5 pb-4">
                    <p className="text-[9px] font-black text-mdOnSurfaceVariant uppercase tracking-[0.2em] mb-1">Authenticed Account</p>
                    <p className="text-sm font-black text-mdPrimary truncate uppercase tracking-tight">{userName}</p>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-mdPrimary/5 text-mdOnSurfaceVariant hover:text-mdPrimary transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-mdPrimary/5 flex items-center justify-center group-hover:bg-mdPrimary group-hover:text-white transition-all">
                      <FontAwesomeIcon icon={faUserCircle} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-widest">My Assembly</span>
                  </button>

                  <button 
                    onClick={() => { onNotificationClick(); setShowProfileMenu(false); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-mdPrimary/5 text-mdOnSurfaceVariant hover:text-mdPrimary transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-mdPrimary/5 flex items-center justify-center group-hover:bg-mdPrimary group-hover:text-white transition-all">
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                      <span className="font-black text-[11px] uppercase tracking-widest">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-mdSecondary text-white text-[9px] font-black rounded-lg">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  <div className="h-px bg-mdOutline/5 my-3 mx-2"></div>
                  
                  <button 
                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-mdError/5 text-mdError transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-mdError/5 flex items-center justify-center group-hover:bg-mdError group-hover:text-white transition-all">
                      <FontAwesomeIcon icon={faSignOutAlt} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-widest">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
