import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 5 * 60 * 1000; // 5 minutes

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const location = useLocation();
    const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/member-dashboard');
    const userType = sessionStorage.getItem('userType');
    
    // Manage active tab state globally or via sessionStorage in Layout
    const [activeTab, setActiveTabInternal] = useState(() => {
        const key = userType === 'admin' ? 'adminActiveTab' : 'memberActiveTab';
        return sessionStorage.getItem(key) || 'home';
    });

    const setActiveTab = (tab) => {
        setActiveTabInternal(tab);
        const key = userType === 'admin' ? 'adminActiveTab' : 'memberActiveTab';
        sessionStorage.setItem(key, tab);
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

    // Clone children to inject activeTab and setActiveTab if needed
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
    });

    return (
        <div className="min-h-screen bg-mdSurface text-mdOnSurface transition-colors duration-300 flex flex-col">
            <Navbar isMobile={isMobile} />
            
            <div className="flex flex-1 pt-16 md:pt-20">
                {isDashboard && userType && (
                    <Sidebar 
                        userType={userType} 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                    />
                )}
                
                <main className={`flex-1 transition-all duration-300 ${isDashboard && userType ? 'md:ml-20 lg:ml-72' : ''}`}>
                    <div className='p-4 md:p-6 lg:p-8 max-w-7xl mx-auto'>
                        {childrenWithProps}
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
                                    <a href="https://wa.me/message/DMJE5W7QXC2MF1" target="_blank" rel="noopener noreferrer" className="hover:text-mdPrimary transition-colors duration-200 font-medium flex items-center justify-center md:justify-start gap-2">
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

