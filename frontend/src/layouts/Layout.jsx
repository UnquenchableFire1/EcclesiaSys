import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 10 * 60 * 1000; // 10 minutes

    // Check for new tab/window logout
    useEffect(() => {
        const sessionId = localStorage.getItem('sessionId');
        const storedSessionId = sessionStorage.getItem('sessionId');
        
        if (sessionId && !storedSessionId) {
            // This is a new tab/window, but a session exists.
            // DO NOT logout immediately. Instead, create a new session ID
            // or trust the existing localStorage.
            // Let's just track this tab as well.
            sessionStorage.setItem('sessionId', sessionId);
        } else if (sessionId) {
            sessionStorage.setItem('sessionId', sessionId);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Activity tracking for session timeout
    useEffect(() => {
        // Only track if logged in
        if (!localStorage.getItem('userId')) return;

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
                localStorage.removeItem('userId');
                localStorage.removeItem('userType');
                localStorage.removeItem('memberEmail');
                localStorage.removeItem('userName');
                localStorage.removeItem('adminActiveTab');
                localStorage.removeItem('memberActiveTab');
                localStorage.removeItem('sessionId');
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
        <div className="min-h-screen bg-mdSurface text-mdOnSurface transition-colors duration-300">
            <Navbar isMobile={isMobile} />
            <main className='pt-16 md:pt-20'>
                <div className='p-4 md:p-6 lg:p-8 max-w-7xl mx-auto'>
                    {children}
                </div>
            </main>
            <footer className="mt-12 bg-mdSurfaceVariant text-mdOnSurfaceVariant py-8 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-white/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                        <div className="text-center">
                            <h3 className="text-mdPrimary font-bold mb-2 text-xl">EcclesiaSys</h3>
                            <p>A digital church designed to make your church management simple.</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-mdPrimary font-bold mb-2 text-xl">Contact Us</h3>
                            <p className="mb-2">
                                <a href="mailto:benjaminbuckmanjunior@gmail.com" className="hover:text-mdPrimary transition-colors duration-200 font-medium">
                                    📧 benjaminbuckmanjunior@gmail.com
                                </a>
                            </p>
                            <p>
                                <a href="https://wa.me/message/DMJE5W7QXC2MF1" target="_blank" rel="noopener noreferrer" className="hover:text-mdPrimary transition-colors duration-200 font-medium">
                                    📱 WhatsApp
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="text-center border-t border-mdOutline/20 pt-4 mt-4">
                        <p>&copy; 2026 EcclesiaSys. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

