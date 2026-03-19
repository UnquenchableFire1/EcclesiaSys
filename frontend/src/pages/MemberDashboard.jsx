import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import MemberProfile from './MemberProfile';
import MemberDirectory from './MemberDirectory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    changePassword,
    getMemberById
} from '../services/api';
import Sidebar from '../components/Sidebar';
import ChangePassword from '../components/ChangePassword';
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
    faFileAlt,
    faPrayingHands,
    faBell,
    faCheck,
    faCheckDouble,
    faVideo
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import DailyVerse from '../components/DailyVerse';
import PrayerRequestModal from '../components/PrayerRequestModal';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { theme, toggleTheme } = useTheme();


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

    const fetchUserNotifications = async () => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;
        try {
            const data = await getNotifications(userId);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchUserNotifications();
        const interval = setInterval(fetchUserNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notifId) => {
        const userId = sessionStorage.getItem('userId');
        try {
            await markNotificationAsRead(notifId, userId);
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


    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        const userId = sessionStorage.getItem('userId');
        const memberEmail = sessionStorage.getItem('memberEmail');

        if (userType !== 'member' || !userId) {
            navigate('/login');
            return;
        }

        // Get member data
        const fetchMemberInfo = async () => {
            try {
                const response = await getMemberById(userId);
                if (response.data && response.data.success) {
                    setMemberData({
                        ...response.data.data,
                        email: memberEmail,
                        userId: userId
                    });
                } else {
                    setMemberData({ email: memberEmail, userId: userId });
                }
            } catch (err) {
                console.error("Failed to fetch member info:", err);
                setMemberData({ email: memberEmail, userId: userId });
            }
        };
        fetchMemberInfo();

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

    const dashboardTabs = [
        { id: 'home', label: 'Overview', icon: faHome },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'prayer', label: 'Prayer Request', icon: faPrayingHands },
        { id: 'directory', label: 'Members', icon: faUsers },
        { id: 'profile', label: 'Profile', icon: faUser },
    ];

    return (
        <div className="min-h-screen bg-mdSurface flex">
            <Sidebar 
                activeTab={activeTab === 'prayer' ? 'home' : activeTab} 
                setActiveTab={(tab) => {
                    if (tab === 'prayer') {
                        setIsPrayerModalOpen(true);
                    } else {
                        setActiveTab(tab);
                    }
                }} 
                tabs={dashboardTabs} 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                userType="member"
                userName={memberName}
                userEmail={memberData?.email}
                onLogout={handleLogout}
                profilePictureUrl={memberData?.profilePictureUrl || memberData?.profile_picture_url}
            />

            <div className="flex-1 flex flex-col min-w-0 md:pl-72 transition-all duration-300">
                {/* Mobile Top Bar */}
                <div className="md:hidden h-16 bg-mdPrimary flex items-center justify-between px-4 text-white sticky top-0 z-50 shadow-md">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-2xl">☰</button>
                    <span className="font-black tracking-tighter">EcclesiaSys</span>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 px-4 py-2 md:px-8 md:py-4 lg:px-12 lg:py-6 max-w-[1600px] w-full mx-auto">

                </div>

                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-4 md:px-0 mt-4 md:mt-0">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">
                            Member Dashboard
                        </h1>
                        <p className="text-mdOnSurfaceVariant font-medium text-lg">
                            Welcome back, <span className="text-mdPrimary font-bold">{memberName}</span>.
                        </p>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                            className="relative p-4 rounded-2xl bg-mdPrimary text-white shadow-md1 hover:shadow-md2 hover:-translate-y-0.5 transition-all duration-200"
                            aria-label="Notifications"
                        >
                            <FontAwesomeIcon icon={faBell} className="text-xl" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center px-2 py-1 text-[10px] font-black leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-mdSecondary rounded-full shadow-sm ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setIsNotificationOpen(false)}></div>
                                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-mdSurface text-mdOnSurface rounded-[2.5rem] shadow-premium border border-mdOutline/10 overflow-hidden z-[101] animate-fade-in-up">
                                    <div className="p-6 border-b border-mdOutline/10 flex justify-between items-center bg-mdSurfaceVariant/20">
                                        <h3 className="font-black text-xl">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs font-black text-mdPrimary hover:underline uppercase tracking-widest"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <div className="w-20 h-20 bg-mdSurfaceVariant/50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                                                    <FontAwesomeIcon icon={faBell} className="text-3xl" />
                                                </div>
                                                <p className="text-mdOnSurfaceVariant font-black text-lg">No notifications yet</p>
                                                <p className="text-xs text-mdOnSurfaceVariant/60 mt-2 uppercase tracking-[0.2em] font-bold">Safe and Sound</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    className={`p-6 border-b border-mdOutline/5 transition-colors duration-200 relative group ${!notif.read ? 'bg-mdPrimaryContainer/10 border-l-4 border-l-mdPrimary' : 'hover:bg-mdSurfaceVariant/10'}`}
                                                >
                                                    <div className="flex justify-between items-start gap-3 mb-2">
                                                        <h4 className={`font-black text-base leading-tight ${!notif.read ? 'text-mdPrimary' : 'text-mdOnSurface'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.read && (
                                                            <button 
                                                                onClick={() => handleMarkAsRead(notif.id)}
                                                                className="p-2 text-mdPrimary hover:bg-mdPrimary/10 rounded-xl transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-mdOnSurfaceVariant font-medium leading-relaxed mb-4">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-mdOutline uppercase tracking-widest">
                                                            {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {notif.read && (
                                                            <span className="text-mdPrimary/40">
                                                                <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* Change Password Tab */}
                {activeTab === 'password' && !loading && (
                    <ChangePassword userType="member" userId={sessionStorage.getItem('userId')} />
                )}

                <div className="max-w-[1600px] mx-auto w-full px-4 md:px-0">
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
                                
                                {modalType === 'sermon' && (
                                    <div className="flex flex-col gap-4 pt-4">
                                        {selectedItem.audioUrl && (
                                            <a 
                                                href={selectedItem.audioUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 bg-mdPrimary text-mdOnPrimary px-8 py-4 rounded-full font-bold shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all w-max"
                                            >
                                                <FontAwesomeIcon icon={faMicrophone} />
                                                Listen to Sermon
                                            </a>
                                        )}
                                        {selectedItem.videoUrl && (
                                            <a 
                                                href={selectedItem.videoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 bg-mdSecondary text-mdOnSecondary px-8 py-4 rounded-full font-bold shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all w-max"
                                            >
                                                <FontAwesomeIcon icon={faVideo} />
                                                Watch Sermon
                                            </a>
                                        )}
                                    </div>
                                )}
                                
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
                                <div className="p-8 pb-4">
                                    <h1 className="text-3xl font-black text-mdPrimary tracking-tighter mb-6">EcclesiaSys</h1>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-mdPrimary tracking-tight">
                                        {isNewMember ? ' Welcome to EcclesiaSys' : 'Welcome back!'}
                                    </h2>
                                </div>
                                <p className="text-lg text-mdOnPrimaryContainer/90 font-medium max-w-2xl">
                                    {isNewMember ? 'Thank you for joining our church community! Explore the portal to stay connected.' : 'Your personalized church community portal. Here is a quick overview.'}
                                </p>
                            </div>
                        </div>

                        {/* Daily Bible Verse */}
                        <div className="mb-8">
                            <DailyVerse />
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
        <PrayerRequestModal isOpen={isPrayerModalOpen} onClose={() => setIsPrayerModalOpen(false)} />
    </div>
</div>
    );
}
