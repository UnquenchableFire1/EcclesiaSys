import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
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
    faUser 
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 15 * 60 * 1000; // Increased to 15 minutes
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const userId = sessionStorage.getItem('userId');
    const userType = sessionStorage.getItem('userType');
    const userName = sessionStorage.getItem('userName') || 'User';
    const userEmail = sessionStorage.getItem('memberEmail') || sessionStorage.getItem('adminEmail');
    const profilePictureUrl = sessionStorage.getItem('profilePictureUrl');

    const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/member-dashboard');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const shouldShowSidebar = userId && !isAuthPage;

    const adminTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/admin' },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn, path: '/announcements' },
        { id: 'events', label: 'Events', icon: faCalendarAlt, path: '/events' },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone, path: '/sermons' },
        { id: 'prayer', label: 'Prayer Requests', icon: faPrayingHands },
        { id: 'profile', label: 'Profile', icon: faUser },
    ];

    const memberTabs = [
        { id: 'home', label: 'Overview', icon: faHome, path: '/member-dashboard' },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn, path: '/announcements' },
        { id: 'events', label: 'Events', icon: faCalendarAlt, path: '/events' },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone, path: '/sermons' },
        { id: 'prayer', label: 'Prayer Request', icon: faPrayingHands, path: '/prayer-request' },
        { id: 'directory', label: 'Members', icon: faUsers },
        { id: 'profile', label: 'Profile', icon: faUser },
    ];

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
    };
    
    // Activity tracking for session timeout
    useEffect(() => {
        // Only track if logged in
        if (!sessionStorage.getItem('userId')) return;

        // Mark activity on user interactions
        const handleActivity = () => {
            setLastActivity(Date.now());
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, handleActivity));

        // Check for inactivity
        const inactivityInterval = setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            if (timeSinceLastActivity > inactivityTimeout) {
                // Logout user
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('userType');
                sessionStorage.removeItem('memberEmail');
                sessionStorage.removeItem('userName');
                sessionStorage.removeItem('adminActiveTab');
                sessionStorage.removeItem('memberActiveTab');
                sessionStorage.removeItem('sessionId');
                window.location.href = '/login';
            }
        }, 30000); // Check every 30 seconds

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearInterval(inactivityInterval);
        };
    }, [lastActivity, inactivityTimeout]);

    return (
        <div className="min-h-screen bg-transparent text-mdOnSurface transition-colors duration-300 flex flex-col overflow-x-hidden">
            <Navbar isMobile={isMobile} />
            
            <div className="flex flex-1 pt-16 md:pt-20">
                {shouldShowSidebar && (
                    <Sidebar 
                        tabs={userType === 'admin' ? adminTabs : memberTabs}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        userType={userType}
                        userName={userName}
                        userEmail={userEmail}
                        profilePictureUrl={profilePictureUrl}
                        onLogout={handleLogout}
                        activeTab={null} // Path based navigation will handle highlighting
                        setActiveTab={(tabId) => {
                            // If a tab has a path, navigate to it, otherwise set active tab in dashboard state
                            // For standalone pages, we rely on path matching in Sidebar.jsx
                            if (tabId === 'profile') {
                                navigate(userType === 'admin' ? '/admin-profile' : '/member-profile');
                            } else if (tabId === 'directory') {
                                navigate('/member-directory');
                            } else if (isDashboard) {
                                // This allows the dashboards to still react to non-path tabs
                                const event = new CustomEvent('setActiveTab', { detail: tabId });
                                window.dispatchEvent(event);
                            }
                        }}
                    />
                )}
                <main className={`flex-1 transition-all duration-300 ${shouldShowSidebar ? 'md:ml-72' : ''}`}>
                    <div className='p-2 md:p-3 lg:p-4 max-w-7xl mx-auto'>
                        {children}
                    </div>
                </main>
            </div>
            
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
                        <div className="text-center border-t border-mdOutline/20 pt-4 mt-4">
                            <p>&copy; 2026 EcclesiaSys. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

