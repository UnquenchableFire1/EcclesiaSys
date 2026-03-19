import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faBell, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

export default function Navbar({ isMobile }) {
  const location = useLocation();
  const [userType, setUserType] = useState(sessionStorage.getItem('userType'));
  const [userName, setUserName] = useState(sessionStorage.getItem('userName'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = () => {
      setUserType(sessionStorage.getItem('userType'));
      setUserName(sessionStorage.getItem('userName'));
    };
    // Note: The 'storage' event only fires for changes in localStorage, not sessionStorage.
    // If you intend to react to sessionStorage changes across tabs/windows, a different mechanism is needed.
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isActive = (path) => location.pathname === path ? 'bg-mdPrimaryContainer text-mdOnPrimaryContainer font-bold' : 'text-mdOnSurface hover:bg-mdSurfaceVariant hover:text-mdOnSurface';

  const fetchUserNotifications = async () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      try {
        const res = await getNotifications(userId);
        if (res.data?.success) {
          const list = res.data.data || [];
          setNotifications(list);
          setUnreadCount(list.filter(n => !n.read).length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }
  };

  useEffect(() => {
    fetchUserNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(() => {
        fetchUserNotifications();
    }, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }, [userType]);

  const handleMarkAsRead = async (id) => {
    const userId = sessionStorage.getItem('userId');
    try {
        await markNotificationAsRead(id, userId);
        fetchUserNotifications();
    } catch (err) {
        console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const userId = sessionStorage.getItem('userId');
    try {
        await markAllNotificationsAsRead(userId);
        fetchUserNotifications();
        setIsNotificationOpen(false);
    } catch (err) {
        console.error("Failed to mark all as read:", err);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isMobileView = windowWidth < 768;

  return (
    <nav className="bg-mdSurface/80 backdrop-blur-xl text-mdOnSurface fixed w-full z-20 shadow-sm border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all active:scale-95">
            <Logo className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          {!isMobileView && (
            <div className="flex items-center space-x-2 font-medium">
              <Link to="/" className={`px-4 py-2 rounded-full transition-all duration-200 ${isActive('/')}`}>Home</Link>
              {userType && (
                <>
                  {!isMobileView && userType === 'member' && (
                    <>
                      <Link to="/announcements" className={`px-4 py-2 rounded-full transition-all duration-200 ${isActive('/announcements')}`}>Announcements</Link>
                      <Link to="/events" className={`px-4 py-2 rounded-full transition-all duration-200 ${isActive('/events')}`}>Events</Link>
                      <Link to="/sermons" className={`px-4 py-2 rounded-full transition-all duration-200 ${isActive('/sermons')}`}>Sermons</Link>
                    </>
                  )}
                  <Link to={userType === 'admin' ? '/admin' : '/member-dashboard'} className={`px-4 py-2 rounded-full transition-all duration-200 ${isActive(userType === 'admin' ? '/admin' : '/member-dashboard')}`}>
                    {userType === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                  </Link>

                  <div className="relative ml-2 flex items-center gap-2">
                    {/* Notifications Dropdown */}
                    <div className="relative">
                      <button 
                          onClick={() => {
                              setIsNotificationOpen(!isNotificationOpen);
                              setIsDropdownOpen(false);
                          }} 
                          className="relative p-2 rounded-full text-mdOnSurface hover:bg-mdSurfaceVariant transition-colors"
                          aria-label="Notifications"
                      >
                          <FontAwesomeIcon icon={faBell} className="text-xl" />
                          {unreadCount > 0 && (
                              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                  {unreadCount}
                              </span>
                          )}
                      </button>
                      
                    </div>

                    <button onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                        setIsNotificationOpen(false);
                    }} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-mdSurfaceVariant transition-colors duration-200 font-bold text-mdPrimary">
                      <span>{userName || userType}</span>
                      <svg className={`w-4 h-4 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.585l3.71-4.356a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-3 bg-mdSurface border border-mdSurfaceVariant rounded-2xl shadow-md2 py-2 w-48 overflow-hidden z-50">
                        <button onClick={handleLogout} className="w-full text-left px-5 py-3 hover:bg-mdErrorContainer hover:text-mdError font-medium transition-colors duration-200">Logout</button>
                      </div>
                    )}
                  </div>
                </>
              )}
              {!userType && (
                <>
                  <Link to="/login" className={`px-4 py-2 rounded-full transition-all duration-200 ${isActive('/login')}`}>Login</Link>
                  <Link to="/register" className="ml-2 px-6 py-2 rounded-full bg-mdPrimary text-mdOnPrimary font-semibold hover:bg-mdSecondary hover:shadow-md1 transition-all duration-200">Register</Link>
                </>
              )}
              {/* Theme Toggle Navbar Button */}
              <button 
                  onClick={toggleTheme} 
                  className="ml-3 p-2 rounded-full text-mdOnSurface bg-mdSurfaceVariant/50 hover:bg-mdSurfaceVariant transition-colors flex items-center justify-center"
                  aria-label="Toggle Theme"
              >
                  <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-lg" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobileView && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-mdOnSurface hover:bg-mdSurfaceVariant rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileView && isMobileMenuOpen && (
          <div className="mt-4 pb-4 space-y-2 border-t border-mdSurfaceVariant pt-4 flex flex-col font-medium">
            <Link to="/" className={`px-4 py-3 rounded-2xl transition-all duration-200 ${isActive('/')}`} onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            {userType && (
              <>
                <Link to="/announcements" className={`px-4 py-3 rounded-2xl transition-all duration-200 ${isActive('/announcements')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Announcements
                </Link>
                <Link to="/events" className={`px-4 py-3 rounded-2xl transition-all duration-200 ${isActive('/events')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Events
                </Link>
                <Link to="/sermons" className={`px-4 py-3 rounded-2xl transition-all duration-200 ${isActive('/sermons')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Sermons
                </Link>
                {userType === 'admin' && (
                  <Link to="/admin" className={`px-4 py-3 rounded-2xl transition-all duration-200 ${isActive('/admin')}`} onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-2xl hover:bg-mdErrorContainer text-mdError font-bold transition-colors duration-200 mt-2">
                  Logout ({userName || userType})
                </button>
              </>
            )}
            {!userType && (
              <>
                <Link to="/login" className={`px-4 py-3 rounded-2xl transition-all duration-200 ${isActive('/login')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="px-4 py-3 rounded-2xl bg-mdPrimary text-mdOnPrimary font-bold text-center mt-2 shadow-md1 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
            
            {/* Mobile Theme & Notifications */}
            <div className="mx-4 flex gap-2">
                <button 
                    onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                        setIsDropdownOpen(false);
                        if (isNotificationOpen) setIsMobileMenuOpen(false);
                    }} 
                    className="flex-1 flex items-center justify-center gap-3 p-3 rounded-2xl bg-mdSurfaceVariant/50 text-mdOnSurface font-bold transition-colors relative"
                    aria-label="Notifications"
                >
                    <FontAwesomeIcon icon={faBell} className="text-lg" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button 
                    onClick={toggleTheme} 
                    className="flex-1 flex items-center justify-center gap-3 p-3 rounded-2xl bg-mdSurfaceVariant/50 text-mdOnSurface font-bold transition-colors"
                >
                    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-lg" />
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Dropdown (Common for both Mobile and Desktop) */}
      {isNotificationOpen && (
          <div className={`fixed ${isMobileView ? 'inset-0 z-[100] flex items-center justify-center p-4' : 'right-4 top-20 z-50' }`}>
              {isMobileView && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotificationOpen(false)}></div>}
              <div className={`${isMobileView ? 'relative w-full max-w-sm' : 'w-80'} bg-mdSurface border border-mdSurfaceVariant rounded-3xl shadow-md3 overflow-hidden animate-fade-in`}>
                  <div className="p-5 border-b border-mdSurfaceVariant flex justify-between items-center bg-mdSurfaceVariant/30">
                      <div className="flex items-center gap-3">
                          <FontAwesomeIcon icon={faBell} className="text-mdPrimary" />
                          <h3 className="font-bold text-mdOnSurface">Notifications</h3>
                      </div>
                      <div className="flex gap-4">
                          {unreadCount > 0 && (
                              <button 
                                  onClick={handleMarkAllAsRead}
                                  className="text-xs text-mdPrimary hover:underline font-bold"
                              >
                                  Read All
                              </button>
                          )}
                          <button onClick={() => setIsNotificationOpen(false)} className="text-mdOnSurfaceVariant hover:text-mdPrimary transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                          <div className="p-10 text-center text-mdOnSurfaceVariant">
                              <p className="text-sm font-medium">No notifications yet.</p>
                          </div>
                      ) : (
                          notifications.map(notification => (
                              <div key={notification.id} className={`p-5 border-b border-mdSurfaceVariant last:border-b-0 hover:bg-mdSurfaceVariant/20 transition-colors ${!notification.read ? 'bg-mdPrimaryContainer/5' : ''}`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className={`font-bold text-sm ${!notification.read ? 'text-mdPrimary' : 'text-mdOnSurface'}`}>{notification.title}</h4>
                                      <span className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-wider">{new Date(notification.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-mdOnSurfaceVariant leading-relaxed">{notification.message}</p>
                                  {!notification.read && (
                                      <button onClick={() => handleMarkAsRead(notification.id)} className="mt-3 text-xs text-mdPrimary font-extrabold hover:text-mdSecondary flex items-center gap-1">
                                          <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> Mark as read
                                      </button>
                                  )}
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-mdSurface rounded-3xl shadow-md3 p-8 max-w-sm w-full mx-auto">
            <h3 className="text-2xl font-bold text-mdOnSurface mb-4">Confirm Logout</h3>
            <p className="text-mdOnSurfaceVariant mb-8 text-lg">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-mdSurfaceVariant hover:bg-mdOutline/20 text-mdOnSurfaceVariant font-bold py-3 rounded-full transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 bg-mdError hover:bg-red-700 text-mdOnError font-bold py-3 rounded-full shadow-md1 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

