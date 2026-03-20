import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 15 * 60 * 1000;
    const navigate = useNavigate();
    const location = useLocation();

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Track active tab state at layout level for BottomNav/Sidebar sync
    const [layoutActiveTab, setLayoutActiveTab] = useState(() => {
        const type = sessionStorage.getItem('userType');
        const key = type === 'admin' ? 'adminActiveTab' : 'memberActiveTab';
        return sessionStorage.getItem(key) || 'home';
    });

    const handleLogout = useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

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
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        // Initial fetch and poll
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
    const userEmail = sessionStorage.getItem('memberEmail') || sessionStorage.getItem('adminEmail');
    const profilePictureUrl = sessionStorage.getItem('profilePictureUrl');

    const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/member-dashboard');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const shouldShowNav = userId && !isAuthPage;

    const adminTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/admin' },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'prayer-requests', label: 'Prayer Requests', icon: faPrayingHands },
        { id: 'profile', label: 'Profile', icon: faUser },
    ];

    const memberTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/member-dashboard' },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'prayer-requests', label: 'Prayer Request', icon: faPrayingHands },
        { id: 'profile', label: 'Profile', icon: faUser },
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
             // If we are currently logged in and navigating "away" or "back" from the dashboard root
             const isAtDashboardRoot = location.pathname === '/admin' || location.pathname === '/member-dashboard';
             if (userId && isAtDashboardRoot) {
                 handleLogout();
             }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location.pathname, handleLogout, userId]);

    return (
        <div className="min-h-screen bg-transparent text-mdOnSurface transition-colors duration-300 flex flex-col overflow-x-hidden pb-20 md:pb-0">
            {!userId && <Navbar isMobile={isMobile} />}
            
            <div className={`flex flex-1 ${!userId ? 'pt-16 md:pt-20' : ''}`}>
                {shouldShowNav && !isMobile && (
                    <Sidebar 
                        tabs={userType === 'admin' ? adminTabs : memberTabs}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        userType={userType}
                        userName={userName}
                        userEmail={userEmail}
                        profilePictureUrl={profilePictureUrl}
                        onLogout={handleLogout}
                        activeTab={layoutActiveTab}
                        setActiveTab={handleTabChange}
                        unreadCount={unreadCount}
                        onNotificationClick={() => setShowNotifications(true)}
                    />
                )}
                
                <main className={`flex-1 transition-all duration-300 ${shouldShowNav && !isMobile ? 'md:ml-72' : ''} relative`}>
                    <div className="grain"></div>
                    <div className="fixed top-[10%] right-[5%] w-[40rem] h-[40rem] bg-mdPrimary/5 rounded-full blur-[120px] -z-10 animate-float opacity-50"></div>
                    <div className="fixed bottom-[10%] left-[10%] w-[30rem] h-[30rem] bg-mdSecondary/5 rounded-full blur-[100px] -z-10 animate-float opacity-30" style={{ animationDelay: '-3s' }}></div>
                    
                    <div className={`p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen ${isMobile ? 'pb-24' : ''}`}>
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
                />
            )}

            {/* Global Notification Modal */}
            {showNotifications && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowNotifications(false)}></div>
                    <div className="glass-card relative z-10 w-full max-w-lg bg-white dark:bg-mdSurface overflow-hidden shadow-premium animate-slide-up border-none">
                        <div className="p-8 border-b border-mdOutline/5 flex items-center justify-between">
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
                                            className={`p-5 rounded-3xl border transition-all cursor-pointer group ${!n.isRead ? 'bg-mdPrimary/5 border-mdPrimary/20' : 'bg-transparent border-mdOutline/5 opacity-60'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-mdOnSurface tracking-tight group-hover:text-mdPrimary transition-colors">
                                                    {n.title || 'New Notification'}
                                                </h4>
                                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-mdPrimary animate-pulse"></div>}
                                            </div>
                                            <p className="text-xs text-mdOnSurfaceVariant font-medium leading-relaxed line-clamp-2">
                                                {n.message}
                                            </p>
                                            <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-mdOutline opacity-50">
                                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                                        <FontAwesomeIcon icon={faBell} className="text-2xl" />
                                    </div>
                                    <p className="font-black text-mdOnSurface/40">No notifications yet</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-mdSurfaceVariant/5 border-t border-mdOutline/5">
                            <button 
                                onClick={() => setShowNotifications(false)}
                                className="w-full py-4 bg-mdOnSurface text-mdSurface rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mdPrimary hover:text-white transition-all shadow-lifted"
                            >
                                Close Alerts
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {!isDashboard && (
                <footer className="mt-12 bg-mdSurfaceVariant text-mdOnSurfaceVariant py-8 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-white/50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div className="text-center md:text-right">
                                <h3 className="text-mdPrimary font-bold mb-2 text-xl">EcclesiaSys</h3>
                                <p>A digital church designed to make your church management simple.</p>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-mdPrimary font-bold mb-2 text-xl">Contact Us</h3>
                                <p className="mb-2">
                                    <a href="mailto:benjaminbuckmanjunior@gmail.com" className="hover:text-mdPrimary transition-colors duration-200 font-medium flex items-center justify-center md:justify-start gap-2">
                                        <FontAwesomeIcon icon={faEnvelope} /> benjaminbuckmanjunior@gmail.com
                                    </a>
                                </p>
                                <p>
                                    <a href="https://wa.me/message/DMJE5W7QXC2MF1" className="hover:text-mdPrimary transition-colors duration-200 font-medium flex items-center justify-center md:justify-start gap-2">
                                        <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
