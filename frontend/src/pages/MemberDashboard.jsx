import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberProfile from './MemberProfile';
import analytics from '../services/analyticsTracker';

export default function MemberDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('memberActiveTab') || 'home');
    const [memberData, setMemberData] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        analytics.trackPageView('Member Dashboard');
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

    const toggleTheme = () => {
        // Theme toggle removed
    };

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
                    setAnnouncements(data.data || data);
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
                    setEvents(data.data || data);
                }
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };

        // Fetch sermons
        const fetchSermons = async () => {
            try {
                const response = await fetch('/api/sermons');
                if (response.ok) {
                    const data = await response.json();
                    setSermons(data.data || data);
                }
            } catch (err) {
                console.error('Error fetching sermons:', err);
            }
        };

        fetchAnnouncements();
        fetchEvents();
        fetchSermons();
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('memberEmail');
        navigate('/login');
    };



    const TabButton = ({ tab, label, icon }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                localStorage.setItem('memberActiveTab', tab);
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
            <div className="min-h-screen bg-tealDeep flex items-center justify-center">
                <p className="text-white text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tealDeep">
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-tealDeep mb-4">Confirm Logout</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Navigation Bar */}
            <div className="bg-gradient-to-r from-tealDeep to-teal-800 text-white sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
                    <div className="flex justify-between items-center py-3 sm:py-4 gap-2">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex-1">
                            👤 Welcome, {memberName}
                        </h1>
                        
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden bg-teal-700 hover:bg-teal-600 text-white px-3 py-2 rounded-lg transition"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base rounded-lg transition font-semibold flex-shrink-0 shadow-md"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Tabs row - Desktop (visible), Mobile dropdown (hidden until menu open) */}
                    <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-0 pb-2 md:pb-0 border-t border-teal-700 md:border-t-0`}>
                        <TabButton tab="home" label="Home" icon="🏠" />
                        <TabButton tab="announcements" label="Announcements" icon="📢" />
                        <TabButton tab="events" label="Events" icon="📅" />
                        <TabButton tab="sermons" label="Sermons" icon="🎙️" />
                        <TabButton tab="profile" label="Profile" icon="👤" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Home Tab */}
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        {/* Welcome Section with Gradient */}
                        <div className="bg-gradient-to-r from-lemon to-yellow-300 rounded-xl p-8 mb-8 shadow-lg">
                            <h2 className="text-4xl font-bold text-tealDeep mb-2">
                                {isNewMember ? '🎉 Welcome to EcclesiaSys!' : '👋 Welcome Back!'}
                            </h2>
                            <p className="text-lg text-tealDeep opacity-90 max-w-2xl">
                                {isNewMember ? 'Thank you for joining our church community! Explore the portal to stay connected and engaged with our community.' : 'Welcome to your church community portal. Stay connected with announcements, events, and sermons.'}
                            </p>
                        </div>

                        {/* Quick Stats Cards */}
                        <div>
                            <h3 className="text-2xl font-bold text-tealDeep mb-4">📊 Quick Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button
                                    onClick={() => {
                                        setActiveTab('announcements');
                                        localStorage.setItem('memberActiveTab', 'announcements');
                                    }}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-t-4 border-lemon cursor-pointer text-center"
                                >
                                    <div className="text-5xl mb-3">📢</div>
                                    <p className="text-4xl font-bold text-lemon mb-2">{announcements.length}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Announcements</p>
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab('events');
                                        localStorage.setItem('memberActiveTab', 'events');
                                    }}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-t-4 border-lemon cursor-pointer text-center"
                                >
                                    <div className="text-5xl mb-3">📅</div>
                                    <p className="text-4xl font-bold text-lemon mb-2">{events.length}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Events</p>
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab('sermons');
                                        localStorage.setItem('memberActiveTab', 'sermons');
                                    }}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-t-4 border-lemon cursor-pointer text-center"
                                >
                                    <div className="text-5xl mb-3">🎙️</div>
                                    <p className="text-4xl font-bold text-lemon mb-2">{sermons.length}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Sermons</p>
                                </button>
                            </div>
                        </div>


                    </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-5xl font-bold text-tealDeep mb-2">📢 Church Announcements</h2>
                            <p className="text-xl text-gray-300">Stay informed with the latest updates</p>
                        </div>
                        {announcements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-lemon hover:shadow-lg transition">
                                        <h3 className="font-bold text-lg text-tealDeep mb-2">{announcement.title}</h3>
                                        <p className="text-gray-700 text-sm break-words">{announcement.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-teal-50 to-yellow-50 p-8 rounded-lg text-center">
                                <p className="text-gray-600 text-lg">No announcements at this time.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-5xl font-bold text-tealDeep mb-2">📅 Upcoming Events</h2>
                            <p className="text-xl text-gray-300">Don't miss out on these important activities</p>
                        </div>
                        {events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                                        <div className="bg-gradient-to-r from-lemon to-yellow-300 p-4">
                                            <h3 className="font-bold text-xl text-tealDeep">{event.title}</h3>
                                        </div>
                                        <div className="p-4 flex-1">
                                            <p className="text-gray-700 text-sm break-words">{event.description}</p>
                                            {event.event_date && (
                                                <p className="text-tealDeep text-sm mt-3 font-semibold">
                                                    📅 {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-teal-50 to-yellow-50 p-8 rounded-lg text-center">
                                <p className="text-gray-600 text-lg">No events at this time.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Sermons Tab */}
                {activeTab === 'sermons' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-5xl font-bold text-tealDeep mb-2">🎙️ Sermon Library</h2>
                            <p className="text-xl text-gray-300">Listen again to our spiritual messages</p>
                        </div>
                        {sermons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sermons.map((sermon) => (
                                    <div key={sermon.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-lemon hover:shadow-lg transition">
                                        <h3 className="font-bold text-lg text-tealDeep mb-2">{sermon.title}</h3>
                                        <p className="text-gray-700 text-sm break-words mb-3">{sermon.description}</p>
                                        {sermon.speaker && (
                                            <p className="text-tealDeep text-sm font-semibold mb-2">
                                                🎤 {sermon.speaker}
                                            </p>
                                        )}
                                        {sermon.sermonDate && (
                                            <p className="text-tealDeep text-sm">
                                                📅 {new Date(sermon.sermonDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-teal-50 to-yellow-50 p-8 rounded-lg text-center">
                                <p className="text-gray-600 text-lg">No sermons available yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && <MemberProfile />}
            </div>
        </div>
    );
}
