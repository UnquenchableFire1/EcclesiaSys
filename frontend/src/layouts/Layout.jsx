import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const inactivityTimeout = 10 * 60 * 1000; // 10 minutes

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Activity tracking for session timeout
    useEffect(() => {
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
                window.location.href = '/login';
            }
        }, 30000); // Check every 30 seconds

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearInterval(inactivityInterval);
        };
    }, [lastActivity, inactivityTimeout]);

    return (
        <div className="min-h-screen bg-tealDeep">
            <Navbar isMobile={isMobile} />
            <main className='pt-16 md:pt-20'>
                <div className='p-4 md:p-6 lg:p-8'>
                    {children}
                </div>
            </main>
            <footer className="mt-12 bg-tealDeep text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                        <div className="text-center">
                            <h3 className="text-lemon font-bold mb-2">EcclesiaSys</h3>
                            <p className="text-white">A digital church designed to make your church management simple.</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lemon font-bold mb-2">Contact Us</h3>
                            <p className="text-white mb-2">
                                <a href="mailto:benjaminbuckmanjunior@gmail.com" className="hover:text-lemon transition">
                                    📧 benjaminbuckmanjunior@gmail.com
                                </a>
                            </p>
                            <p className="text-white">
                                <a href="https://wa.me/message/DMJE5W7QXC2MF1" target="_blank" rel="noopener noreferrer" className="hover:text-lemon transition">
                                    📱 WhatsApp
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="text-center border-t border-teal-600 pt-4">
                        <p className="text-white">&copy; 2026 EcclesiaSys. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

