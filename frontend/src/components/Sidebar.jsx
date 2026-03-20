import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faChevronLeft, 
  faKey,
  faUserCircle,
  faBell,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  tabs, 
  isOpen, 
  setIsOpen, 
  userType, 
  userName, 
  userEmail,
  onLogout,
  profilePictureUrl,
  unreadCount = 0,
  onNotificationClick
}) {
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Only */}
      <aside className="
        hidden md:flex fixed top-0 left-0 bottom-0 z-[101] 
        bg-white/70 dark:bg-mdSurface/70 backdrop-blur-2xl
        border-r border-mdOutline/10
        w-72 flex-col shadow-premium transition-all duration-500
      ">
        {/* Brand/Header */}
        <div className="h-28 flex items-center px-8 border-b border-mdOutline/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mdPrimary to-mdSecondary opacity-50"></div>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-mdPrimary tracking-tighter leading-none mb-1">EcclesiaSys</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-mdOnSurfaceVariant opacity-50">Digital Sanctuary</p>
          </div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-mdPrimary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
        </div>

        {/* User Info - Sleeker Design */}
        <div className="p-8 group">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mdPrimary to-mdSecondary p-[2px] shadow-lifted group-hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-mdSurface overflow-hidden">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-mdPrimary text-xl">
                      <FontAwesomeIcon icon={faUserCircle} />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-mdSurface rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-mdOnSurface truncate text-lg tracking-tight">{userName}</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-mdPrimary"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-mdPrimary">{userType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - More Interactive */}
        <nav className="flex-1 overflow-y-auto py-4 px-6 space-y-3 custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  show-on-desktop
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-500 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-mdPrimary text-white shadow-lifted translate-x-1' 
                    : 'text-mdOnSurfaceVariant hover:bg-mdPrimary/5 hover:text-mdPrimary'}
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-white/20 rotate-6' : 'bg-mdSurfaceVariant/30 group-hover:bg-mdPrimaryContainer group-hover:rotate-3'}`}>
                  <FontAwesomeIcon icon={tab.icon} className={isActive ? 'text-white' : 'text-mdPrimary'} />
                </div>
                <span className="flex-1 text-left tracking-tight uppercase text-[11px]">{tab.label}</span>
                
                {isActive && (
                  <>
                    <div className="absolute left-0 w-1.5 h-6 bg-white rounded-full animate-glow-pulse"></div>
                    <div className="absolute right-4 opacity-50 text-[10px]">
                      <FontAwesomeIcon icon={faChevronRight} className="animate-slide-right" />
                    </div>
                  </>
                )}
              </button>
            );
          })}

          <div className="h-px bg-mdOutline/5 my-8 mx-4"></div>

          {/* Action Links */}
          <button
            onClick={() => setActiveTab('password')}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-500
              ${activeTab === 'password' 
                ? 'bg-mdSecondary text-white shadow-md2 translate-x-1' 
                : 'text-mdOnSurfaceVariant hover:bg-mdSecondary/10 hover:text-mdSecondary'}
            `}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === 'password' ? 'bg-white/20' : 'bg-mdSurfaceVariant/30'}`}>
              <FontAwesomeIcon icon={faKey} />
            </div>
            <span className="flex-1 text-left uppercase text-[11px]">Security</span>
          </button>
        </nav>

        {/* Brand Theme Toggle & Logout Footer */}
        <div className="p-8 border-t border-mdOutline/5 bg-mdSurfaceVariant/5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant opacity-60">Theme Mode</span>
            <button 
                onClick={toggleTheme}
                className="w-12 h-6 rounded-full bg-mdSurfaceVariant/30 relative transition-all duration-500 border border-mdOutline/10"
            >
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ${theme === 'dark' ? 'right-1 bg-white text-mdSurface' : 'left-1 bg-mdPrimary text-white shadow-md1'}`}>
                  <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-[8px]" />
                </div>
            </button>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-mdError hover:bg-mdError/10 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-mdError/5 flex items-center justify-center group-hover:bg-mdError group-hover:text-white transition-all shadow-sm">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <span className="uppercase text-[11px] tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal - Higher Z-Index and positioned for Sidebar */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-mdSurface rounded-3xl shadow-premium p-8 max-w-sm w-full mx-auto border border-mdOutline/10 transform animate-scale-in">
            <h3 className="text-2xl font-black text-mdOnSurface mb-4 tracking-tight text-center">Confirm Logout</h3>
            <p className="text-mdOnSurfaceVariant mb-8 text-lg font-medium text-center">Are you sure you want to logout of your account?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-mdSurfaceVariant hover:bg-mdOutline/20 text-mdOnSurfaceVariant font-bold py-4 rounded-2xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 bg-mdError hover:bg-red-700 text-mdOnError font-bold py-4 rounded-2xl shadow-md1 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
