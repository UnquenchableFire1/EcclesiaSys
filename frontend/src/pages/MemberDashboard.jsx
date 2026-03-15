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
            className={`px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 whitespace-nowrap rounded-t-2xl ${
                activeTab === tab
                    ? 'bg-mdSurface text-mdPrimary border-b-4 border-mdPrimary'
                    : 'text-mdOnPrimary hover:bg-white/10'
            }`}
        >
            <span className="hidden sm:inline mr-2">{icon}</span>
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-mdSurface outline-none animate-fade-in relative z-10 transition-colors duration-300 py-4">
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
            {/* Navigation Bar */}
            <div className="bg-mdPrimary text-mdOnPrimary rounded-3xl shadow-md2 mx-4 md:mx-6 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex justify-between items-center py-4 gap-4">
                        <h1 className="text-xl md:text-2xl font-extrabold flex-1 tracking-tight">
                            Member Dashboard
                        </h1>
                        
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-mdSurface hover:bg-mdSurfaceVariant text-mdPrimary px-4 py-2 sm:px-6 sm:py-2 text-sm md:text-base rounded-full shadow-md1 transition-all duration-200 font-bold flex-shrink-0"
                        >
                            {isMobile ? 'Logout' : `Logout (${memberName})`}
                        </button>
                    </div>

                    {/* Tabs row */}
                    <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 pb-2 md:pb-0 pt-2`}>
                        <TabButton tab="home" label="Overview" icon="🏠" />
                        <TabButton tab="announcements" label="Announcements" icon="📢" />
                        <TabButton tab="events" label="Events" icon="📅" />
                        <TabButton tab="sermons" label="Sermons" icon="🎙️" />
                        <TabButton tab="support" label="Support" icon="🎧" />
                        <TabButton tab="profile" label="Profile" icon="👤" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Home Tab */}
                {activeTab === 'home' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Welcome Section */}
                        <div className="bg-mdPrimaryContainer px-8 py-10 rounded-[2rem] shadow-sm mb-8 border border-white/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-mdPrimary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-mdPrimary mb-3 tracking-tight">
                                    {isNewMember ? '🎉 Welcome to EcclesiaSys' : 'Welcome back!'}
                                </h2>
                                <p className="text-lg text-mdOnPrimaryContainer/90 font-medium max-w-2xl">
                                    {isNewMember ? 'Thank you for joining our church community! Explore the portal to stay connected.' : 'Your personalized church community portal. Here is a quick overview.'}
                                </p>
                            </div>
                        </div>

                        {/* Quick Links with Counts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Card 1 */}
                            <button
                                onClick={() => { setActiveTab('announcements'); localStorage.setItem('memberActiveTab', 'announcements'); }}
                                className="bg-mdSurface rounded-3xl shadow-sm hover:shadow-md3 transition-all duration-300 border border-mdSurfaceVariant cursor-pointer group flex items-center p-6 h-full text-left"
                            >
                                <div className="bg-mdPrimaryContainer w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm mr-6">📣</div>
                                <div>
                                    <p className="text-4xl font-extrabold text-mdPrimary mb-1 tracking-tight">{announcements.length}</p>
                                    <p className="text-mdOnSurfaceVariant font-semibold text-lg">Announcements</p>
                                </div>
                            </button>

                            {/* Card 2 */}
                            <button
                                onClick={() => { setActiveTab('events'); localStorage.setItem('memberActiveTab', 'events'); }}
                                className="bg-mdSurface rounded-3xl shadow-sm hover:shadow-md3 transition-all duration-300 border border-mdSurfaceVariant cursor-pointer group flex items-center p-6 h-full text-left"
                            >
                                <div className="bg-mdSecondaryContainer w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm mr-6">📅</div>
                                <div>
                                    <p className="text-4xl font-extrabold text-mdSecondary mb-1 tracking-tight">{events.length}</p>
                                    <p className="text-mdOnSurfaceVariant font-semibold text-lg">Events</p>
                                </div>
                            </button>

                            {/* Card 3 */}
                            <button
                                onClick={() => { setActiveTab('sermons'); localStorage.setItem('memberActiveTab', 'sermons'); }}
                                className="bg-mdSurface rounded-3xl shadow-sm hover:shadow-md3 transition-all duration-300 border border-mdSurfaceVariant cursor-pointer group flex items-center p-6 h-full text-left"
                            >
                                <div className="bg-mdPrimaryContainer w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm mr-6">🎙️</div>
                                <div>
                                    <p className="text-4xl font-extrabold text-mdPrimary mb-1 tracking-tight">{sermons.length}</p>
                                    <p className="text-mdOnSurfaceVariant font-semibold text-lg">Sermons</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <span className="text-2xl">📢</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">Recent Announcements</h2>
                        </div>
                        {announcements.length > 0 ? (
                            <div className="grid gap-6">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300">
                                        <h3 className="font-extrabold text-xl text-mdOnSurface mb-2">{announcement.title}</h3>
                                        <p className="text-mdOnSurfaceVariant text-base leading-relaxed whitespace-pre-line">{announcement.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-mdSurfaceVariant/30 border border-mdSurfaceVariant rounded-3xl p-12 text-center">
                                <p className="text-mdOnSurfaceVariant text-lg font-medium">No announcements at this time.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-mdSecondaryContainer p-4 rounded-2xl">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-mdSecondary tracking-tight">Upcoming Events</h2>
                        </div>
                        {events.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col h-full">
                                        <div className="flex-1">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface mb-3">{event.title}</h3>
                                            <p className="text-mdOnSurfaceVariant text-base leading-relaxed whitespace-pre-line">{event.description}</p>
                                        </div>
                                        {event.event_date && (
                                            <div className="mt-6 inline-flex items-center gap-2 bg-mdSecondaryContainer/50 text-mdSecondary px-4 py-2 rounded-full font-bold text-sm w-max">
                                                <span>📅</span>
                                                {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-mdSurfaceVariant/30 border border-mdSurfaceVariant rounded-3xl p-12 text-center">
                                <p className="text-mdOnSurfaceVariant text-lg font-medium">No events scheduled at this time.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Sermons Tab */}
                {activeTab === 'sermons' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <span className="text-2xl">🎙️</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">Sermon Library</h2>
                        </div>
                        {sermons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sermons.map((sermon) => (
                                    <div key={sermon.id} className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col h-full">
                                        <div className="flex-1">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface mb-3 leading-snug">{sermon.title}</h3>
                                            <p className="text-mdOnSurfaceVariant text-sm leading-relaxed mb-4 line-clamp-4">{sermon.description}</p>
                                        </div>
                                        <div className="mt-auto space-y-2 pt-4 border-t border-mdSurfaceVariant text-sm font-medium text-mdOutline">
                                            {sermon.speaker && (
                                                <p className="flex items-center gap-2">
                                                    <span className="text-mdPrimary">👤</span> {sermon.speaker}
                                                </p>
                                            )}
                                            {sermon.sermonDate && (
                                                <p className="flex items-center gap-2">
                                                    <span className="text-mdPrimary">📅</span> {new Date(sermon.sermonDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-mdSurfaceVariant/30 border border-mdSurfaceVariant rounded-3xl p-12 text-center">
                                <p className="text-mdOnSurfaceVariant text-lg font-medium">No sermons available yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Support Tab */}
                {activeTab === 'support' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-mdSecondaryContainer p-4 rounded-2xl">
                                <span className="text-2xl">🎧</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-mdSecondary tracking-tight">Help & Support</h2>
                        </div>
                        <div className="bg-mdSurface p-8 rounded-3xl shadow-sm border border-mdSurfaceVariant flex flex-col md:flex-row gap-8 items-center justify-between">
                            <div className="flex-1 w-full max-w-xl">
                                <h3 className="font-extrabold text-2xl text-mdOnSurface mb-4">Need Assistance?</h3>
                                <p className="text-mdOnSurfaceVariant text-lg leading-relaxed mb-8">
                                    Our support team is always here to help you. Whether you have questions about the digital church or need technical assistance, feel free to reach out to us.
                                </p>
                                <div className="space-y-4">
                                    <a href="mailto:benjaminbuckmanjunior@gmail.com" className="flex items-center gap-4 p-4 bg-mdPrimaryContainer/20 hover:bg-mdPrimaryContainer/40 rounded-2xl transition-colors duration-300">
                                        <div className="bg-mdPrimaryContainer text-mdPrimary w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0">📧</div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-mdOnSurfaceVariant mb-1 uppercase tracking-wider">Email Us</p>
                                            <p className="text-mdPrimary font-bold truncate">benjaminbuckmanjunior@gmail.com</p>
                                        </div>
                                    </a>
                                    <a href="https://wa.me/message/DMJE5W7QXC2MF1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-mdSecondaryContainer/20 hover:bg-mdSecondaryContainer/40 rounded-2xl transition-colors duration-300">
                                        <div className="bg-mdSecondaryContainer text-mdSecondary w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0">📱</div>
                                        <div>
                                            <p className="text-xs font-bold text-mdOnSurfaceVariant mb-1 uppercase tracking-wider">WhatsApp</p>
                                            <p className="text-mdSecondary font-bold truncate">Chat with Support</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-1 justify-center p-8">
                                <div className="text-9xl opacity-10 filter drop-shadow-sm transition-transform hover:scale-110 duration-500">💬</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && <MemberProfile />}
            </div>
        </div>
    );
}
