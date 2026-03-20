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
    faBell,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { getNotifications, markNotificationAsRead } from '../services/api';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Responsive breakpoint for top nav
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 15 * 60 * 1000;
    const navigate = useNavigate();
    const location = useLocation();

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Track active tab state at layout level for Nav sync
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
    const userEmail = sessionStorage.getItem('userEmail');
    const profilePictureUrl = sessionStorage.getItem('profilePictureUrl');

    const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/member-dashboard');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const shouldShowNav = userId && !isAuthPage;

    const adminTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/admin' },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'announcements', label: 'News', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'prayer-requests', label: 'Prayers', icon: faPrayingHands },
    ];

    const memberTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/member-dashboard' },
        { id: 'announcements', label: 'Sanctuary News', icon: faBullhorn },
        { id: 'events', label: 'Calendar', icon: faCalendarAlt },
        { id: 'sermons', label: 'Library', icon: faMicrophone },
        { id: 'prayer-requests', label: 'Prayer Chamber', icon: faPrayingHands },
    ];

    // Activity tracking for session timeout
    useEffect(() => {
        if (!userId) return;
        const handleActivity = () => setLastActivity(Date.now());
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, handleActivity));
        const inactivityInterval = setInterval(() => {
            if (Date.now() - lastActivity > inactivityTimeout) handleLogout();
        }, 30000);
        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearInterval(inactivityInterval);
        };
    }, [lastActivity, inactivityTimeout, handleLogout, userId]);

    const handleTabChange = (tabId) => {
        setLayoutActiveTab(tabId);
        const targetDashboard = userType === 'admin' ? '/admin' : '/member-dashboard';
        const eventName = userType === 'admin' ? 'setActiveTab' : 'setMemberActiveTab';
        
        if (location.pathname !== targetDashboard) {
            navigate(targetDashboard);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent(eventName, { detail: tabId }));
            }, 100);
        } else {
            window.dispatchEvent(new CustomEvent(eventName, { detail: tabId }));
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id, userId);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    // Handle back button logout refinement
    useEffect(() => {
        const handlePopState = () => {
             const isAtDashboardRoot = location.pathname === '/admin' || location.pathname === '/member-dashboard';
             if (userId && isAtDashboardRoot) {
                 handleLogout();
             }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location.pathname, handleLogout, userId]);

    return (
        <div className="min-h-screen bg-mdSurface text-mdOnSurface flex flex-col overflow-x-hidden transition-colors duration-500">
            {/* Global Background Effects */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-mdPrimary via-mdSecondary to-mdPrimary opacity-50 z-[1001]"></div>
            <div className="fixed top-[10%] right-[5%] w-[40rem] h-[40rem] bg-mdPrimary/5 rounded-full blur-[120px] -z-10 animate-float opacity-50"></div>
            <div className="fixed bottom-[10%] left-[10%] w-[30rem] h-[30rem] bg-mdSecondary/5 rounded-full blur-[100px] -z-10 animate-float opacity-30" style={{ animationDelay: '-3s' }}></div>

            {!userId && <Navbar isMobile={isMobile} />}
            
            {shouldShowNav && !isMobile && (
                <AuthNavbar 
                    tabs={userType === 'admin' ? adminTabs : memberTabs}
                    activeTab={layoutActiveTab}
                    setActiveTab={handleTabChange}
                    userName={userName}
                    userType={userType}
                    profilePictureUrl={profilePictureUrl}
                    onLogout={handleLogout}
                    unreadCount={unreadCount}
                    onNotificationClick={() => setShowNotifications(true)}
                />
            )}

            <div className={`flex flex-1 flex-col ${shouldShowNav && !isMobile ? 'pt-20' : ''}`}>
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
                    onLogout={handleLogout}
                />
            )}

            {/* Global Notification Modal */}
            {showNotifications && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md shadow-premium" onClick={() => setShowNotifications(false)}></div>
                    <div className="glass-card relative z-10 w-full max-w-lg bg-white overflow-hidden shadow-premium animate-slide-up border-none rounded-[2.5rem]">
                        <div className="p-8 border-b border-mdOutline/5 flex items-center justify-between bg-gradient-to-b from-mdPrimary/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary">
                                    <FontAwesomeIcon icon={faBell} className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter">Sanctuary Alerts</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-mdOutline opacity-60">{unreadCount} Unread</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="w-10 h-10 rounded-xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdOnSurface hover:bg-mdError hover:text-white transition-all">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${!n.isRead ? 'bg-mdPrimary/5 border-mdPrimary/20 shadow-sm' : 'bg-transparent border-mdOutline/5 opacity-60'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-mdOnSurface tracking-tight group-hover:text-mdPrimary transition-colors">
                                                    {n.title || 'New Notification'}
                                                </h4>
                                                {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-mdPrimary animate-pulse shadow-md1"></div>}
                                            </div>
                                            <p className="text-xs text-mdOnSurfaceVariant font-medium leading-relaxed line-clamp-2">
                                                {n.message}
                                            </p>
                                            <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-mdOutline opacity-50 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-mdOutline"></div>
                                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-24 text-center">
                                    <div className="w-20 h-20 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30 shadow-inner">
                                        <FontAwesomeIcon icon={faBell} className="text-3xl" />
                                    </div>
                                    <p className="font-black text-mdOnSurface/30 text-lg uppercase tracking-widest">No alerts in the sanctuary</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-mdSurfaceVariant/5 border-t border-mdOutline/5">
                            <button 
                                onClick={() => setShowNotifications(false)}
                                className="w-full py-5 bg-mdOnSurface text-mdSurface rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-mdPrimary hover:text-white transition-all shadow-premium"
                            >
                                Close Sanctuary Alerts
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {!isDashboard && (
                <footer className="mt-12 bg-mdSurfaceVariant text-mdOnSurfaceVariant py-12 rounded-t-[3rem] shadow-premium border-t border-mdOutline/5">
                    <div className="container mx-auto px-8 max-w-[1200px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-left">
                                <h3 className="text-mdPrimary font-black mb-2 text-2xl tracking-tighter">EcclesiaSys</h3>
                                <p className="text-sm font-medium opacity-60">Digital Sanctuary Management for the Modern Church Experience.</p>
                            </div>
                            <div className="flex flex-col gap-4 text-sm font-bold items-center md:items-end">
                                <a href="mailto:benjaminbuckmanjunior@gmail.com" className="hover:text-mdPrimary transition-all duration-300 flex items-center gap-3">
                                    <FontAwesomeIcon icon={faEnvelope} className="opacity-50" /> benjaminbuckmanjunior@gmail.com
                                </a>
                                <a href="https://wa.me/message/DMJE5W7QXC2MF1" className="hover:text-mdPrimary transition-all duration-300 flex items-center gap-3">
                                    <FontAwesomeIcon icon={faWhatsapp} className="opacity-50" /> Official WhatsApp Support
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
