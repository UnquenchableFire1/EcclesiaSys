import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberProfile from './MemberProfile';
import MemberDirectory from './MemberDirectory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, 
    faBullhorn, 
    faCalendarAlt, 
    faMicrophone, 
    faHeadset, 
    faUser, 
    faSignOutAlt,
    faEnvelope,
    faPhone,
    faUsers,
    faChevronRight,
    faClock,
    faMapMarkerAlt,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import DailyVerse from '../components/DailyVerse';

export default function MemberDashboard() {
    const [activeTab, setActiveTabInternal] = useState(() => {
        return sessionStorage.getItem('memberActiveTab') || 'home';
    });

    const setActiveTab = (tab) => {
        setActiveTabInternal(tab);
        sessionStorage.setItem('memberActiveTab', tab);
    };
    const navigate = useNavigate();
    const [memberData, setMemberData] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const memberName = sessionStorage.getItem('userName') || 'Member';
    const isNewMember = sessionStorage.getItem('isNewMember') === 'true';

    useEffect(() => {
        if (isNewMember) {
            sessionStorage.removeItem('isNewMember');
        }
    }, [isNewMember]);

    const toggleTheme = () => {
        // Theme toggle removed
    };

    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        const userId = sessionStorage.getItem('userId');
        const memberEmail = sessionStorage.getItem('memberEmail');

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
            onClick={() => setActiveTab(tab)}
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
            <div className="bg-mdPrimary text-mdOnPrimary rounded-3xl shadow-md2 mx-4 md:mx-6 overflow-hidden mb-10">
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
                        <TabButton tab="home" label="Overview" icon={<FontAwesomeIcon icon={faHome} />} />
                        <TabButton tab="announcements" label="Announcements" icon={<FontAwesomeIcon icon={faBullhorn} />} />
                        <TabButton tab="events" label="Events" icon={<FontAwesomeIcon icon={faCalendarAlt} />} />
                        <TabButton tab="sermons" label="Sermons" icon={<FontAwesomeIcon icon={faMicrophone} />} />
                        <TabButton tab="directory" label="Members" icon={<FontAwesomeIcon icon={faUsers} />} />
                        <TabButton tab="profile" label="Profile" icon={<FontAwesomeIcon icon={faUser} />} />
                    </div>
                </div>
            </div>

            {/* Detail View Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-premium max-w-2xl w-full mx-auto relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header/Decorative */}
                        <div className={`h-32 w-full shrink-0 relative ${
                            modalType === 'event' ? 'bg-gradient-to-r from-accent to-accent-dark' : 
                            modalType === 'announcement' ? 'bg-gradient-to-r from-secondary to-blue-900' : 
                            'bg-gradient-to-r from-primary to-teal-800'
                        }`}>
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                            <div className="absolute -bottom-10 left-10 w-20 h-20 rounded-3xl bg-white shadow-lifted flex items-center justify-center text-3xl">
                                <FontAwesomeIcon 
                                    icon={modalType === 'event' ? faCalendarAlt : modalType === 'announcement' ? faBullhorn : faMicrophone} 
                                    className={modalType === 'event' ? 'text-accent' : modalType === 'announcement' ? 'text-secondary' : 'text-primary'}
                                />
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 pt-16 overflow-y-auto">
                            <h3 className="text-3xl font-black text-onSurface mb-4 leading-tight">
                                {selectedItem.title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-4 mb-8">
                                {modalType === 'event' && selectedItem.event_date && (
                                    <div className="flex items-center gap-2 bg-accent/10 text-accent-dark px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faClock} />
                                        {new Date(selectedItem.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                )}
                                {selectedItem.location && (
                                    <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        {selectedItem.location}
                                    </div>
                                )}
                                {selectedItem.speaker && (
                                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faUser} />
                                        {selectedItem.speaker}
                                    </div>
                                )}
                                {selectedItem.sermonDate && (
                                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        {new Date(selectedItem.sermonDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <p className="text-onSurface-variant text-lg leading-relaxed whitespace-pre-line">
                                    {selectedItem.description || selectedItem.message}
                                </p>
                                
                                {selectedItem.file_url && (
                                    <a 
                                        href={selectedItem.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-secondary text-white px-8 py-4 rounded-full font-bold shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all"
                                    >
                                        <FontAwesomeIcon icon={faFileAlt} />
                                        View Attached Document
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-8 border-t border-gray-100 bg-gray-50 shrink-0">
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="w-full bg-onSurface text-white py-4 rounded-full font-bold shadow-premium hover:shadow-lifted transition-all"
                            >
                                Close Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                {/* Home Tab */}
                {activeTab === 'home' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Welcome Section */}
                        <div className="bg-mdPrimaryContainer px-8 py-10 rounded-[2rem] shadow-sm mb-8 border border-white/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-mdPrimary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-mdPrimary mb-3 tracking-tight">
                                    {isNewMember ? ' Welcome to EcclesiaSys' : 'Welcome back!'}
                                </h2>
                                <p className="text-lg text-mdOnPrimaryContainer/90 font-medium max-w-2xl">
                                    {isNewMember ? 'Thank you for joining our church community! Explore the portal to stay connected.' : 'Your personalized church community portal. Here is a quick overview.'}
                                </p>
                            </div>
                        </div>

                        {/* Daily Bible Verse */}
                        <div className="mb-8">
                            <DailyVerse />
                        </div>

                        {/* Quick Links with Counts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Card 1 */}
                            <button
                                onClick={() => { setActiveTab('announcements'); }}
                                className="bg-mdSurface rounded-3xl shadow-sm hover:shadow-md3 transition-all duration-300 border border-mdSurfaceVariant cursor-pointer group flex items-center p-6 h-full text-left"
                            >
                                <div className="bg-mdPrimaryContainer w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm mr-6"></div>
                                <div>
                                    <p className="text-4xl font-extrabold text-mdPrimary mb-1 tracking-tight">{announcements.length}</p>
                                    <p className="text-mdOnSurfaceVariant font-semibold text-lg">Announcements</p>
                                </div>
                            </button>

                            {/* Card 2 */}
                            <button
                                onClick={() => { setActiveTab('events'); }}
                                className="bg-mdSurface rounded-3xl shadow-sm hover:shadow-md3 transition-all duration-300 border border-mdSurfaceVariant cursor-pointer group flex items-center p-6 h-full text-left"
                            >
                                <div className="bg-mdSecondaryContainer w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm mr-6">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-mdSecondary" />
                                </div>
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
                                <div className="bg-mdPrimaryContainer w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm mr-6"></div>
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
                            <div className="bg-secondary/10 p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faBullhorn} className="text-2xl text-secondary" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-secondary tracking-tight">Recent Announcements</h2>
                        </div>
                        {announcements.length > 0 ? (
                            <div className="grid gap-6">
                                {announcements.map((announcement) => (
                                    <div 
                                        key={announcement.id} 
                                        onClick={() => { setSelectedItem(announcement); setModalType('announcement'); }}
                                        className="bg-white p-8 rounded-[2rem] shadow-premium border border-white/20 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-black text-2xl text-onSurface group-hover:text-secondary transition-colors">{announcement.title}</h3>
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </div>
                                        </div>
                                        <p className="text-onSurface-variant text-base leading-relaxed line-clamp-3">{announcement.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/50 border border-white/40 rounded-[2rem] p-16 text-center">
                                <p className="text-onSurface-variant text-lg font-medium">No announcements at this time.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-accent/10 p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-2xl text-accent-dark" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-accent-dark tracking-tight">Upcoming Events</h2>
                        </div>
                        {events.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-8">
                                {events.map((event) => (
                                    <div 
                                        key={event.id} 
                                        onClick={() => { setSelectedItem(event); setModalType('event'); }}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white/20 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-black text-2xl text-onSurface group-hover:text-accent-dark transition-colors">{event.title}</h3>
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </div>
                                            </div>
                                            <p className="text-onSurface-variant text-base leading-relaxed line-clamp-4 mb-6">{event.description}</p>
                                        </div>
                                        {event.event_date && (
                                            <div className="mt-auto inline-flex items-center gap-3 bg-accent/10 text-accent-dark px-6 py-3 rounded-full font-black text-sm w-max uppercase tracking-widest shadow-sm">
                                                <FontAwesomeIcon icon={faClock} />
                                                {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/50 border border-white/40 rounded-[2rem] p-16 text-center">
                                <p className="text-onSurface-variant text-lg font-medium">No events scheduled at this time.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Sermons Tab */}
                {activeTab === 'sermons' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-primary/10 p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faMicrophone} className="text-2xl text-primary" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-primary tracking-tight">Sermon Library</h2>
                        </div>
                        {sermons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {sermons.map((sermon) => (
                                    <div 
                                        key={sermon.id} 
                                        onClick={() => { setSelectedItem(sermon); setModalType('sermon'); }}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white/20 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-black text-2xl text-onSurface group-hover:text-primary transition-colors leading-tight">{sermon.title}</h3>
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </div>
                                            </div>
                                            <p className="text-onSurface-variant text-sm leading-relaxed mb-6 line-clamp-3">{sermon.description}</p>
                                        </div>
                                        <div className="mt-auto space-y-3 pt-6 border-t border-gray-100 text-sm font-bold text-gray-500">
                                            {sermon.speaker && (
                                                <p className="flex items-center gap-3">
                                                    <FontAwesomeIcon icon={faUser} className="text-primary" /> {sermon.speaker}
                                                </p>
                                            )}
                                            {sermon.sermonDate && (
                                                <p className="flex items-center gap-3">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" /> {new Date(sermon.sermonDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/50 border border-white/40 rounded-[2rem] p-16 text-center">
                                <p className="text-onSurface-variant text-lg font-medium">No sermons available yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Directory Tab */}
                {activeTab === 'directory' && <MemberDirectory />}

                {/* Support Tab */}
                {activeTab === 'support' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-secondary/10 p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faHeadset} className="text-2xl text-secondary" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-secondary tracking-tight">Help & Support</h2>
                        </div>
                        <div className="bg-white p-12 rounded-[3rem] shadow-premium border border-white/20 flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <h3 className="font-black text-3xl text-onSurface mb-6">Need Assistance?</h3>
                                <p className="text-onSurface-variant text-xl leading-relaxed mb-10">
                                    Our support team is here to help you. Reach out via email or WhatsApp for quick assistance.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <a href="mailto:benjaminbuckmanjunior@gmail.com" className="flex items-center gap-5 p-6 bg-primary/5 hover:bg-primary/10 rounded-3xl transition-all duration-300 group">
                                        <div className="bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lifted transition-transform group-hover:scale-110">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Email Us</p>
                                            <p className="text-onSurface font-black truncate">Support Team</p>
                                        </div>
                                    </a>
                                    <a href="https://wa.me/message/DMJE5W7QXC2MF1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-6 bg-emerald-50 hover:bg-emerald-100 rounded-3xl transition-all duration-300 group">
                                        <div className="bg-emerald-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lifted transition-transform group-hover:scale-110">
                                            <FontAwesomeIcon icon={faWhatsapp} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">WhatsApp</p>
                                            <p className="text-onSurface font-black truncate">Chat Now</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className="hidden lg:block w-1/3">
                                <div className="text-9xl text-gray-100 animate-pulse flex justify-center">
                                    <FontAwesomeIcon icon={faHeadset} />
                                </div>
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
