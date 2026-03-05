
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar({ isMobile }) {
  const location = useLocation();
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // update when storage changes (login/logout from other tabs)
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

  return (
    <nav className="bg-blue-600 text-white fixed w-full z-20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">BBJ Church</h1>
        <div className="flex items-center space-x-6">
          <Link to="/" className={`hover:text-yellow-300 transition ${isActive('/')}`}>Home</Link>
          {userType && (
            <>
              <Link to="/announcements" className={`hover:text-yellow-300 transition ${isActive('/announcements')}`}>Announcements</Link>
              <Link to="/events" className={`hover:text-yellow-300 transition ${isActive('/events')}`}>Events</Link>
              <Link to="/sermons" className={`hover:text-yellow-300 transition ${isActive('/sermons')}`}>Sermons</Link>
              {userType === 'admin' && (
                <Link to="/admin" className={`hover:text-yellow-300 transition ${isActive('/admin')}`}>Dashboard</Link>
              )}

              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 hover:text-yellow-300">
                  <span>{userName || userType}</span>
                  <svg className={`w-4 h-4 transform transition ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.585l3.71-4.356a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-blue-600 rounded-lg shadow-lg py-2 w-40">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            </>
          )}
          {!userType && (
            <>
              <Link to="/login" className={`hover:text-yellow-300 transition ${isActive('/login')}`}>Login</Link>
              <Link to="/register" className={`hover:text-yellow-300 transition ${isActive('/register')}`}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
