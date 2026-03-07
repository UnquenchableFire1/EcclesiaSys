import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberProfile from './MemberProfile';

export default function MemberDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [memberData, setMemberData] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const memberName = localStorage.getItem('userName') || 'Member';
    const isNewMember = localStorage.getItem('isNewMember') === 'true';

    useEffect(() => {
        if (isNewMember) {
            localStorage.removeItem('isNewMember');
        }
    }, [isNewMember]);

    useEffect(() => {
        const userType = localStorage.getItem('userType');
        const userId = localStorage.getItem('userId');
        const memberEmail = localStorage.getItem('memberEmail');

        if (userType !== 'member' || !userId) {
            navigate('/login');
            return;
        }

        // Get member data
        setMemberData({
            email: memberEmail,
            userId: userId
        });

        // Fetch announcements
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch('/api/announcements');
                if (response.ok) {
                    const data = await response.json();
                    setAnnouncements((data.data || data).slice(0, 5));
                }
            } catch (err) {
                console.error('Error fetching announcements:', err);
            }
        };

        // Fetch events
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events');
                if (response.ok) {
                    const data = await response.json();
                    setEvents((data.data || data).slice(0, 5));
                }
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };

        fetchAnnouncements();
        fetchEvents();
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('memberEmail');
        navigate('/login');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const TabButton = ({ tab, label, icon }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
            }}
            className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                activeTab === tab
                    ? 'bg-white text-tealDeep border-b-4 border-lemon'
                    : 'text-white hover:bg-opacity-80'
            }`}
        >
            <span className="hidden sm:inline">{icon} </span>
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <div className="bg-tealDeep text-white sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
                    <div className="flex justify-between items-center py-2 sm:py-3 gap-2">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex-1">
                            Member Dashboard
                        </h1>
                        
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden bg-tealDeep hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition font-semibold"
                            title="Toggle theme"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg transition font-semibold flex-shrink-0"
                        >
                            {isMobile ? 'Logout' : `Logout (${memberName})`}
                        </button>
                    </div>

                    {/* Tabs row - Desktop (visible), Mobile dropdown (hidden until menu open) */}
                    <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-0 pb-2 md:pb-0`}>
                        <TabButton tab="home" label="Home" icon="🏠" />
                        <TabButton tab="announcements" label="Announcements" icon="📢" />
                        <TabButton tab="events" label="Events" icon="📅" />
                        <TabButton tab="profile" label="Profile" icon="👤" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                {/* Home Tab */}
                {activeTab === 'home' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Welcome Section */}
                        <div className="mb-2 sm:mb-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep mb-1 sm:mb-2">
                                {isNewMember ? '🎉 Welcome to BBJ Digital Church!' : 'Welcome back!'}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                {isNewMember ? 'Thank you for joining our church community! Explore the portal to stay connected.' : 'Welcome to your church community portal'}
                            </p>
                        </div>

                        {/* Member Info Card */}
                        {memberData && (
                            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 border-l-4 border-lemon">
                                <h2 className="text-base sm:text-lg md:text-xl font-bold text-tealDeep mb-3 sm:mb-4">Your Account</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <p className="text-gray-600 text-xs sm:text-sm">Member ID</p>
                                        <p className="text-base sm:text-lg font-semibold text-tealDeep break-all">{memberData.userId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-xs sm:text-sm">Email</p>
                                        <p className="text-base sm:text-lg font-semibold text-tealDeep break-all">{memberData.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                            <a
                                href="/announcements"
                                className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition border-t-4 border-lemon cursor-pointer"
                            >
                                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📣</div>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-tealDeep mb-1 sm:mb-2">Announcements</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">Stay updated with church news and updates</p>
                            </a>

                            <a
                                href="/events"
                                className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition border-t-4 border-lemon cursor-pointer"
                            >
                                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🗓️</div>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-tealDeep mb-1 sm:mb-2">Events</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">Browse upcoming church events and activities</p>
                            </a>

                            <a
                                href="/sermons"
                                className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition border-t-4 border-lemon cursor-pointer"
                            >
                                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎙️</div>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-tealDeep mb-1 sm:mb-2">Sermons</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">Listen to our latest sermons and teachings</p>
                            </a>
                        </div>

                        {/* Announcements Section */}
                        {announcements.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
                                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-tealDeep">Latest Announcements</h2>
                                    <a href="/announcements" className="text-lemon hover:text-tealDeep font-semibold transition text-sm sm:text-base whitespace-nowrap">
                                        View All →
                                    </a>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {announcements.map((announcement) => (
                                        <div key={announcement.id} className="border-l-4 border-lemon pl-3 sm:pl-4 py-2">
                                            <h3 className="font-bold text-base sm:text-lg text-tealDeep">{announcement.title}</h3>
                                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">{announcement.message}</p>
                                            {announcement.created_date && (
                                                <p className="text-gray-500 text-xs mt-2">
                                                    {new Date(announcement.created_date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events Section */}
                        {events.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
                                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-tealDeep">Upcoming Events</h2>
                                    <a href="/events" className="text-lemon hover:text-tealDeep font-semibold transition text-sm sm:text-base whitespace-nowrap">
                                        View All →
                                    </a>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="border-l-4 border-lemon pl-3 sm:pl-4 py-2">
                                            <h3 className="font-bold text-base sm:text-lg text-tealDeep">{event.title}</h3>
                                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">{event.description}</p>
                                            {event.event_date && (
                                                <p className="text-gray-500 text-xs mt-2">
                                                    📅 {new Date(event.event_date).toLocaleDateString()}{' '}
                                                    {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                            {event.location && (
                                                <p className="text-gray-500 text-xs">📍 {event.location}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep">All Announcements</h2>
                        {announcements.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                        <h3 className="font-bold text-base sm:text-lg text-tealDeep">{announcement.title}</h3>
                                        <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">{announcement.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No announcements at this time.</p>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep">All Events</h2>
                        {events.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                        <h3 className="font-bold text-base sm:text-lg text-tealDeep">{event.title}</h3>
                                        <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">{event.description}</p>
                                        {event.event_date && (
                                            <p className="text-gray-500 text-xs mt-2">
                                                📅 {new Date(event.event_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No events at this time.</p>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && <MemberProfile />}
            </div>
        </div>
    );
}
