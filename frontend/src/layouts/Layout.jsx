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
    faTimes,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { getNotifications, markNotificationAsRead } from '../services/api';

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
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'prayer-requests', label: 'Prayers', icon: faPrayingHands },
    ];

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
                    onLogout={() => setShowLogoutConfirm(true)}
                />
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 animate-fade-in shadow-premium">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="glass-card relative z-10 w-full max-w-sm bg-white overflow-hidden shadow-premium animate-scale-in border-none rounded-[2rem] p-8">
                        <div className="w-16 h-16 bg-mdError/10 rounded-2xl flex items-center justify-center text-mdError mx-auto mb-6">
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-2xl" />
                        </div>
                        <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter text-center mb-2">Exiting Sanctuary?</h3>
                        <p className="text-sm font-medium text-mdOnSurfaceVariant text-center mb-8">Are you sure you want to logout from your account?</p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-4 bg-mdSurfaceVariant/30 text-mdOnSurface font-black rounded-xl hover:bg-mdSurfaceVariant/50 transition-all uppercase text-[10px] tracking-widest"
                            >
                                Stay Here
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="flex-1 py-4 bg-mdError text-white font-black rounded-xl hover:shadow-lifted transition-all uppercase text-[10px] tracking-widest"
                            >
                                Confirm Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    <div key={n.id} onClick={() => handleMarkAsRead(n.id)} className={`p-4 rounded-2xl border ${!n.isRead ? 'bg-mdPrimary/5 border-mdPrimary/10' : 'opacity-60 border-transparent'} cursor-pointer`}>
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
