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
            const response = await getNotifications(userId);
            const data = response.data?.data || response.data || [];
            setNotifications(Array.isArray(data) ? data : []);
            setUnreadCount(Array.isArray(data) ? data.filter(n => !n.read).length : 0);
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
        { id: 'announcements', label: 'Announcements', icon: faBullhorn, path: '/announcements' },
        { id: 'events', label: 'Events', icon: faCalendarAlt, path: '/events' },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone, path: '/sermons' },
        { id: 'prayer', label: 'Prayer Request', icon: faPrayingHands, path: '/prayer-request' },
        { id: 'directory', label: 'Members', icon: faUsers },
        { id: 'profile', label: 'Profile', icon: faUser },
    ];

    return (
        <div className="min-h-screen bg-mdSurface flex">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                tabs={dashboardTabs} 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                userType="member"
                userName={memberName}
                userEmail={memberData?.email}
                onLogout={handleLogout}
                profilePictureUrl={memberData?.profilePictureUrl || memberData?.profile_picture_url}
                unreadCount={unreadCount}
                onNotificationClick={() => setActiveTab('notifications')}
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
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {memberData?.profilePictureUrl || memberData?.profile_picture_url ? (
                                <img 
                                    src={memberData?.profilePictureUrl || memberData?.profile_picture_url} 
                                    alt="Profile" 
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-mdPrimaryContainer shadow-md1 transition-transform group-hover:scale-105 duration-300"
                                />
                            ) : (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-mdPrimary text-white flex items-center justify-center text-3xl font-black shadow-md">
                                    {memberName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-1">
                                {memberName}
                            </h1>
                            <p className="text-mdPrimary font-black text-lg uppercase tracking-widest bg-mdPrimary/5 px-4 py-1 rounded-full w-max">
                                Church Member
                            </p>
                        </div>
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

                                {/* Quick Links / Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                    <div 
                                        onClick={() => navigate('/sermons')}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white/20 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 bg-mdPrimary/10 rounded-2xl flex items-center justify-center text-mdPrimary text-2xl mb-6 group-hover:scale-110 transition-transform">
                                            <FontAwesomeIcon icon={faMicrophone} />
                                        </div>
                                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">Latest Sermons</h3>
                                        <p className="text-mdOnSurfaceVariant font-medium">Watch and listen to recent messages.</p>
                                    </div>

                                    <div 
                                        onClick={() => navigate('/events')}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white/20 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 bg-mdSecondary/10 rounded-2xl flex items-center justify-center text-mdSecondary text-2xl mb-6 group-hover:scale-110 transition-transform">
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                        </div>
                                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">Upcoming Events</h3>
                                        <p className="text-mdOnSurfaceVariant font-medium">Stay updated with church activities.</p>
                                    </div>

                                    <div 
                                        onClick={() => navigate('/announcements')}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white/20 hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 text-2xl mb-6 group-hover:scale-110 transition-transform">
                                            <FontAwesomeIcon icon={faBullhorn} />
                                        </div>
                                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">Announcements</h3>
                                        <p className="text-mdOnSurfaceVariant font-medium">Important news and updates.</p>
                                    </div>
                                </div>

                                {/* Daily Bible Verse */}
                                <div className="mb-8">
                                    <DailyVerse />
                                </div>
                            </div>
                        )}




                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-mdPrimary/10 p-4 rounded-2xl">
                                    <FontAwesomeIcon icon={faBell} className="text-2xl text-mdPrimary" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">Your Notifications</h2>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="bg-mdPrimary/10 hover:bg-mdPrimary text-mdPrimary hover:text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
                                >
                                    Mark All as Read
                                </button>
                            )}
                        </div>
                        <div className="bg-white dark:bg-mdSurface rounded-[2.5rem] border border-mdOutline/10 overflow-hidden divide-y divide-mdOutline/5 shadow-premium">
                            {!Array.isArray(notifications) || notifications.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                                        <FontAwesomeIcon icon={faBell} className="text-4xl text-mdPrimary" />
                                    </div>
                                    <p className="text-xl font-black text-mdOnSurface mb-1">All caught up!</p>
                                    <p className="text-mdOnSurfaceVariant font-medium">You don't have any notifications at the moment.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-8 transition-all duration-300 relative ${!notif.read ? 'bg-mdPrimaryContainer/10 border-l-8 border-mdPrimary' : 'hover:bg-mdSurfaceVariant/5'}`}
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-black leading-tight mb-2 ${!notif.read ? 'text-mdPrimary' : 'text-mdOnSurface'}`}>
                                                    {notif.title}
                                                </h3>
                                                <p className="text-lg text-mdOnSurfaceVariant font-medium leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    className="shrink-0 w-12 h-12 bg-mdPrimary text-white rounded-2xl flex items-center justify-center shadow-md hover:shadow-md2 transition-all active:scale-90"
                                                    title="Mark as read"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-mdOutline uppercase tracking-widest mt-4">
                                            <FontAwesomeIcon icon={faClock} className="text-mdPrimary/50" />
                                            {new Date(notif.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
                                    <a href="https://wa.me/message/DMJE5W7QXC2MF1" className="flex items-center gap-5 p-6 bg-emerald-50 hover:bg-emerald-100 rounded-3xl transition-all duration-300 group">
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
