import React from 'react';
import Logo from './Logo';
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
  onLogout,
  profilePictureUrl 
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

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
        <div className="h-24 flex items-center justify-between px-6 border-b border-mdOutline/5 bg-white dark:bg-mdSurface">
          <Logo />
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-mdPrimary hover:bg-mdPrimary/10 p-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-mdPrimaryContainer/20 border-b border-mdOutline/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mdPrimary flex items-center justify-center text-white shadow-md1 overflow-hidden">
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
              )}
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
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-mdError hover:bg-mdError/10 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-mdError/10 flex items-center justify-center group-hover:bg-mdError group-hover:text-white transition-all">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <span>Logout</span>
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
