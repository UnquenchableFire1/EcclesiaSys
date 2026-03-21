import Navbar from '../components/Navbar';
import AuthNavbar from '../components/AuthNavbar';
import BottomNav from '../components/BottomNav';
import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEnvelope, 
    faHome, 
    faBullhorn, 
    faCalendarAlt, 
    faMicrophone, 
    faPrayingHands, 
    faUsers, 
    faUser,
    faSignOutAlt,
    faComments,
    faUserShield,
    faUserCircle,
    faBell,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getNotifications, markNotificationAsRead } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 15 * 60 * 1000;
    const navigate = useNavigate();
    const location = useLocation();

    // UI state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Track active tab state
    const [layoutActiveTab, setLayoutActiveTab] = useState(() => {
        const type = sessionStorage.getItem('userType');
        const key = type === 'admin' ? 'adminActiveTab' : 'memberActiveTab';
        return sessionStorage.getItem(key) || 'home';
    });

    const handleLogout = useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login'; 
    }, []);

    const fetchNotifications = useCallback(async () => {
        const uId = sessionStorage.getItem('userId');
        if (!uId) return;
        try {
            const response = await getNotifications(uId);
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    const userId = sessionStorage.getItem('userId');
    const userType = sessionStorage.getItem('userType');
    const userName = sessionStorage.getItem('userName') || 'User';
    const profilePictureUrl = sessionStorage.getItem('profilePictureUrl');

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const shouldShowNav = userId && !isAuthPage;

    const isSuperAdmin = (sessionStorage.getItem('userEmail') || '').toLowerCase() === 'benjaminbuckmanjunior@gmail.com';

    const adminTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/admin' },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'announcements', label: 'News', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'chat', label: 'Sanctuary Chat', icon: faComments },
        { id: 'prayer-requests', label: 'Prayers', icon: faPrayingHands },
        ...(isSuperAdmin ? [{ id: 'admins', label: 'Commanders', icon: faUserShield }] : []),
    ];

    const memberTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/member-dashboard' },
        {id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'chat', label: 'Support Chat', icon: faComments },
        { id: 'prayer-requests', label: 'Prayers', icon: faPrayingHands },
    ];

    const handleTabChange = (tabId) => {
        if (tabId === 'prayer-requests' && userType === 'member') {
            navigate('/prayer-request');
            return;
        }
        
        setLayoutActiveTab(tabId);
        const targetDashboard = userType === 'admin' ? '/admin' : '/member-dashboard';
        const eventName = 'setActiveTab';
        
        if (location.pathname !== targetDashboard) {
            navigate(targetDashboard);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent(eventName, { detail: tabId }));
            }, 100);
        } else {
            window.dispatchEvent(new CustomEvent(eventName, { detail: tabId }));
        }
    };

    const handleNotificationClick = async (notif) => {
        try {
            await markNotificationAsRead(notif.id, userId);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            // Navigate based on type
            if (notif.type === 'member' || notif.type === 'members') {
                handleTabChange('members');
            } else if (notif.type === 'event' || notif.type === 'events') {
                handleTabChange('events');
            } else if (notif.type === 'sermon' || notif.type === 'sermons') {
                handleTabChange('sermons');
            } else if (notif.type === 'announcement' || notif.type === 'announcements') {
                handleTabChange('announcements');
            } else if (notif.type === 'prayer' || notif.type === 'prayer-requests') {
                handleTabChange('prayer-requests');
            } else {
                // Fallback to substring matching if type is generic or missing
                const content = (notif.title + ' ' + notif.message).toLowerCase();
                if (content.includes('member')) handleTabChange('members');
                else if (content.includes('event')) handleTabChange('events');
                else if (content.includes('sermon')) handleTabChange('sermons');
                else if (content.includes('announcement')) handleTabChange('announcements');
                else if (content.includes('prayer')) handleTabChange('prayer-requests');
            }
            setShowNotifications(false);
        } catch (err) {
            console.error("Failed to handle notification click:", err);
        }
    };

    return (
        <div className="min-h-screen bg-mdSurface text-mdOnSurface flex flex-col overflow-x-hidden">
            {!userId && <Navbar isMobile={isMobile} />}
            
            {shouldShowNav && !isMobile && (
                <AuthNavbar 
                    tabs={userType === 'admin' ? adminTabs : memberTabs}
                    activeTab={layoutActiveTab}
                    setActiveTab={handleTabChange}
                    userName={userName}
                    userType={userType}
                    profilePictureUrl={profilePictureUrl}
                    onLogout={() => setShowLogoutConfirm(true)}
                    unreadCount={unreadCount}
                    onNotificationClick={() => setShowNotifications(true)}
                />
            )}

            {shouldShowNav && isMobile && (
                <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/70 backdrop-blur-2xl border-b border-mdOutline/10 h-16 px-6 flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black text-mdPrimary tracking-tighter leading-none mb-0.5">EcclesiaSys</h2>
                        <p className="text-[7px] font-black uppercase tracking-[0.2em] text-mdSecondary font-bold">The Sanctuary</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileProfileOpen(true)}
                            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm transition-transform active:scale-95 relative"
                        >
                            {profilePictureUrl ? (
                                <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-mdPrimary/10 text-mdPrimary">
                                    <FontAwesomeIcon icon={faUserCircle} />
                                </div>
                            )}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-mdError rounded-full border-2 border-white"></span>
                            )}
                        </button>
                    </div>
                </header>
            )}

            {/* Mobile Profile Menu Overlay */}
            {isMobile && isMobileProfileOpen && (
                <div className="fixed inset-0 z-[2000] animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMobileProfileOpen(false)}></div>
                    <div className="absolute right-4 top-4 w-72 bg-white rounded-[2.5rem] shadow-premium border border-mdOutline/10 p-6 animate-scale-in origin-top-right">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-mdOutline/5">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lifted">
                                {profilePictureUrl ? (
                                    <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-mdPrimary/10 text-mdPrimary font-black text-xl">
                                        {userName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-mdOnSurface truncate">{userName}</h3>
                                <p className="text-[9px] font-bold text-mdPrimary uppercase tracking-widest">{userType}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button 
                                onClick={() => { handleTabChange('profile'); setIsMobileProfileOpen(false); }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-mdPrimary/5 text-mdOnSurface font-bold transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-mdPrimary/5 flex items-center justify-center text-mdPrimary group-hover:bg-mdPrimary group-hover:text-white transition-all">
                                    <FontAwesomeIcon icon={faUserCircle} />
                                </div>
                                <span className="text-xs uppercase tracking-widest">My Sanctuary</span>
                            </button>

                            <button 
                                onClick={() => { setShowNotifications(true); setIsMobileProfileOpen(false); }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-mdPrimary/5 text-mdOnSurface font-bold transition-all group relative"
                            >
                                <div className="w-10 h-10 rounded-xl bg-mdPrimary/5 flex items-center justify-center text-mdPrimary group-hover:bg-mdPrimary group-hover:text-white transition-all">
                                    <FontAwesomeIcon icon={faBell} />
                                </div>
                                <span className="text-xs uppercase tracking-widest">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute right-4 px-2 py-0.5 bg-mdSecondary text-white text-[8px] font-black rounded-lg">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-px bg-mdOutline/5 my-4 mx-2"></div>

                            <button 
                                onClick={() => { setShowLogoutConfirm(true); setIsMobileProfileOpen(false); }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-mdError/5 text-mdError font-bold transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-mdError/5 flex items-center justify-center text-mdError group-hover:bg-mdError group-hover:text-white transition-all">
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </div>
                                <span className="text-xs uppercase tracking-widest">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-1 flex-col ${shouldShowNav && !isMobile ? 'pt-20' : shouldShowNav && isMobile ? 'pt-16' : ''}`}>
                <main className="flex-1 relative">
                    <div className="grain"></div>
                    <div className={`p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] ${isMobile && userId ? 'pb-32' : 'pb-12'}`}>
                        {children}
                    </div>
                </main>
            </div>

            {shouldShowNav && isMobile && (
                <BottomNav 
                    tabs={userType === 'admin' ? adminTabs : memberTabs}
                    activeTab={layoutActiveTab}
                    setActiveTab={handleTabChange}
                    unreadCount={unreadCount}
                    onNotificationClick={() => setShowNotifications(true)}
                    onLogout={() => setShowLogoutConfirm(true)}
                />
            )}

            {/* Logout Confirmation Modal */}
            <ConfirmModal 
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Exiting Sanctuary?"
                message="Are you sure you want to logout from your account?"
                confirmText="Confirm Logout"
                cancelText="Stay Here"
                type="danger"
                icon={faSignOutAlt}
            />

            {/* Notifications Modal */}
            {showNotifications && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowNotifications(false)}></div>
                    <div className="glass-card relative z-10 w-full max-w-lg bg-white overflow-hidden shadow-premium animate-slide-up border-none rounded-[2.5rem]">
                        <div className="p-8 border-b border-mdOutline/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary">
                                    <FontAwesomeIcon icon={faBell} className="text-xl" />
                                </div>
                                <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter">Sanctuary Alerts</h3>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="text-mdOnSurfaceVariant hover:text-mdError transition-colors"><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 rounded-2xl border ${!n.isRead ? 'bg-mdPrimary/5 border-mdPrimary/10' : 'opacity-60 border-transparent'} cursor-pointer`}>
                                        <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                                        <p className="text-xs text-mdOnSurfaceVariant">{n.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 opacity-40 font-bold">No alerts</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
