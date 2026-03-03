import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ isMobile = false }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'border-b-2 border-lemon' : '';
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-tealDeep shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
                        <div className="w-8 h-8 bg-lemon rounded-full flex items-center justify-center">
                            <span className="text-tealDeep font-bold">✝</span>
                        </div>
                        BBJ
                    </Link>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <div className="flex items-center gap-8">
                            <Link to="/" className={`text-white hover:text-lemon transition ${isActive('/')}`}>
                                Home
                            </Link>
                            <Link to="/announcements" className={`text-white hover:text-lemon transition ${isActive('/announcements')}`}>
                                Announcements
                            </Link>
                            <Link to="/events" className={`text-white hover:text-lemon transition ${isActive('/events')}`}>
                                Events
                            </Link>
                            <Link to="/sermons" className={`text-white hover:text-lemon transition ${isActive('/sermons')}`}>
                                Sermons
                            </Link>

                            {userType && (
                                <>
                                    {userType === 'admin' && (
                                        <Link to="/admin-dashboard" className={`text-white hover:text-lemon transition ${isActive('/admin-dashboard')}`}>
                                            Dashboard
                                        </Link>
                                    )}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="text-white hover:text-lemon transition flex items-center gap-2"
                                        >
                                            👤 {userName}
                                            <span className={`transform transition ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white text-tealDeep rounded-lg shadow-lg py-2">
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-lemon transition">
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {!userType && (
                                <>
                                    <Link to="/login" className="text-white hover:text-lemon transition border border-lemon rounded px-4 py-2">
                                        Login
                                    </Link>
                                    <Link to="/register" className="bg-lemon text-tealDeep rounded px-4 py-2 font-semibold hover:bg-yellow-300 transition">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white text-2xl"
                        >
                            ☰
                        </button>
                    )}
                </div>

                {/* Mobile Navigation */}
                {isMobile && isMenuOpen && (
                    <div className="mt-4 space-y-3 bg-tealDeep border-t border-lemon pt-4">
                        <Link to="/" className="block text-white hover:text-lemon transition py-2">
                            Home
                        </Link>
                        <Link to="/announcements" className="block text-white hover:text-lemon transition py-2">
                            Announcements
                        </Link>
                        <Link to="/events" className="block text-white hover:text-lemon transition py-2">
                            Events
                        </Link>
                        <Link to="/sermons" className="block text-white hover:text-lemon transition py-2">
                            Sermons
                        </Link>

                        {userType && (
                            <>
                                {userType === 'admin' && (
                                    <Link to="/admin-dashboard" className="block text-white hover:text-lemon transition py-2">
                                        Dashboard
                                    </Link>
                                )}
                                <div className="space-y-2 py-2 border-t border-lemon">
                                    <p className="text-white text-sm">Logged in as: {userName}</p>
                                    <button onClick={handleLogout} className="w-full bg-lemon text-tealDeep rounded px-4 py-2 font-semibold hover:bg-yellow-300 transition">
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}

                        {!userType && (
                            <div className="space-y-2 py-2 border-t border-lemon">
                                <Link to="/login" className="block text-center text-white border border-lemon rounded px-4 py-2 hover:bg-lemon hover:text-tealDeep transition">
                                    Login
                                </Link>
                                <Link to="/register" className="block text-center bg-lemon text-tealDeep rounded px-4 py-2 font-semibold hover:bg-yellow-300 transition">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

