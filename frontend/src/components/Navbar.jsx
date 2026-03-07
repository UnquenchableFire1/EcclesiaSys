
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar({ isMobile }) {
  const location = useLocation();
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = () => {
      setUserType(localStorage.getItem('userType'));
      setUserName(localStorage.getItem('userName'));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isActive = (path) => location.pathname === path ? 'text-lemon' : '';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isMobileView = windowWidth < 768;

  return (
    <nav className="bg-tealDeep text-white fixed w-full z-20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl md:text-2xl font-bold hover:text-lemon transition">
            BBJ Digital
          </Link>

          {/* Desktop Navigation */}
          {!isMobileView && (
            <div className="flex items-center space-x-6">
              <Link to="/" className={`hover:text-lemon transition ${isActive('/')}`}>Home</Link>
              {userType && (
                <>
                  <Link to="/announcements" className={`hover:text-lemon transition ${isActive('/announcements')}`}>Announcements</Link>
                  <Link to="/events" className={`hover:text-lemon transition ${isActive('/events')}`}>Events</Link>
                  <Link to="/sermons" className={`hover:text-lemon transition ${isActive('/sermons')}`}>Sermons</Link>
                  {userType === 'admin' && (
                    <Link to="/admin" className={`hover:text-lemon transition ${isActive('/admin')}`}>Dashboard</Link>
                  )}

                  <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 hover:text-lemon">
                      <span>{userName || userType}</span>
                      <svg className={`w-4 h-4 transform transition ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.585l3.71-4.356a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 bg-white text-tealDeep rounded-lg shadow-lg py-2 w-40">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                      </div>
                    )}
                  </div>
                </>
              )}
              {!userType && (
                <>
                  <Link to="/login" className={`hover:text-lemon transition ${isActive('/login')}`}>Login</Link>
                  <Link to="/register" className={`hover:text-lemon transition ${isActive('/register')}`}>Register</Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobileView && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-opacity-80 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileView && isMobileMenuOpen && (
          <div className="mt-4 pb-4 space-y-2 border-t border-opacity-20 border-white pt-4">
            <Link to="/" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/')}`} onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            {userType && (
              <>
                <Link to="/announcements" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/announcements')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Announcements
                </Link>
                <Link to="/events" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/events')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Events
                </Link>
                <Link to="/sermons" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/sermons')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Sermons
                </Link>
                {userType === 'admin' && (
                  <Link to="/admin" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/admin')}`} onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition">
                  Logout ({userName || userType})
                </button>
              </>
            )}
            {!userType && (
              <>
                <Link to="/login" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/login')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className={`block px-4 py-2 rounded hover:bg-opacity-10 hover:bg-white transition ${isActive('/register')}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

