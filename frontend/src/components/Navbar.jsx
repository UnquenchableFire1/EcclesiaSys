import logo from "../assets/logo.png";

export default function Navbar({ isMobile }) {
  const location = useLocation();
  const [userType, setUserType] = useState(sessionStorage.getItem('userType'));
  const [userName, setUserName] = useState(sessionStorage.getItem('userName'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
            <img src={logo} alt="EcclesiaSys Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="text-xl md:text-2xl font-black text-mdPrimary tracking-tighter">
              EcclesiaSys
            </span>
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

                  <div className="relative ml-2">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-mdSurfaceVariant transition-colors duration-200 font-bold text-mdPrimary">
                      <span>{userName || userType}</span>
                      <svg className={`w-4 h-4 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.585l3.71-4.356a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 bg-mdSurface border border-mdSurfaceVariant rounded-2xl shadow-md2 py-2 w-48 overflow-hidden z-50">
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
          </div>
        )}
      </div>

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

