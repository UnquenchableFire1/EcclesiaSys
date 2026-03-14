import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberProfile from './MemberProfile';

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
                        <TabButton tab="sermons" label="Sermons" icon="🎙️" />
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
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon mb-1 sm:mb-2">
                                {isNewMember ? '🎉 Welcome to EcclesiaSys' : 'Welcome back!'}
                            </h2>
                            <p className="text-sm sm:text-base text-white">
                                {isNewMember ? 'Thank you for joining our church community! Explore the portal to stay connected.' : 'Welcome to your church community portal'}
                            </p>
                        </div>

                        {/* Quick Links with Counts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                            <button
                                onClick={() => {
                                    setActiveTab('announcements');
                                    localStorage.setItem('memberActiveTab', 'announcements');
                                }}
                                className="bg-teal-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 hover:bg-teal-700 transition border-t-4 border-lemon cursor-pointer flex flex-col items-center justify-center"
                            >
                                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📣</div>
                                <p className="text-3xl sm:text-4xl font-bold text-lemon mb-1">{announcements.length}</p>
                                <p className="text-xs sm:text-sm text-yellow-200 text-center">Announcements</p>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab('events');
                                    localStorage.setItem('memberActiveTab', 'events');
                                }}
                                className="bg-teal-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 hover:bg-teal-700 transition border-t-4 border-lemon cursor-pointer flex flex-col items-center justify-center"
                            >
                                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📅</div>
                                <p className="text-3xl sm:text-4xl font-bold text-lemon mb-1">{events.length}</p>
                                <p className="text-xs sm:text-sm text-yellow-200 text-center">Events</p>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab('sermons');
                                    localStorage.setItem('memberActiveTab', 'sermons');
                                }}
                                className="bg-teal-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 hover:bg-teal-700 transition border-t-4 border-lemon cursor-pointer flex flex-col items-center justify-center"
                            >
                                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🎙️</div>
                                <p className="text-3xl sm:text-4xl font-bold text-lemon mb-1">{sermons.length}</p>
                                <p className="text-xs sm:text-sm text-yellow-200 text-center">Sermons</p>
                            </button>
                        </div>


                    </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">All Announcements</h2>
                        {announcements.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="bg-teal-800 p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                        <h3 className="font-bold text-base sm:text-lg text-lemon">{announcement.title}</h3>
                                        <p className="text-white text-xs sm:text-sm mt-1 break-words">{announcement.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-yellow-200">No announcements at this time.</p>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">All Events</h2>
                        {events.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-teal-800 p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                        <h3 className="font-bold text-base sm:text-lg text-lemon">{event.title}</h3>
                                        <p className="text-white text-xs sm:text-sm mt-1 break-words">{event.description}</p>
                                        {event.event_date && (
                                            <p className="text-yellow-200 text-xs mt-2">
                                                📅 {new Date(event.event_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-yellow-200">No events at this time.</p>
                        )}
                    </div>
                )}

                {/* Sermons Tab */}
                {activeTab === 'sermons' && (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">Sermon Library</h2>
                        {sermons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {sermons.map((sermon) => (
                                    <div key={sermon.id} className="bg-teal-800 p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                        <h3 className="font-bold text-base sm:text-lg text-lemon">{sermon.title}</h3>
                                        <p className="text-white text-xs sm:text-sm mt-2 break-words">{sermon.description}</p>
                                        {sermon.speaker && (
                                            <p className="text-yellow-200 text-xs mt-2">
                                                <span className="font-semibold">Speaker:</span> {sermon.speaker}
                                            </p>
                                        )}
                                        {sermon.sermonDate && (
                                            <p className="text-yellow-200 text-xs mt-2">
                                                📅 {new Date(sermon.sermonDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-yellow-200">No sermons available yet.</p>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && <MemberProfile />}
            </div>
        </div>
    );
}
