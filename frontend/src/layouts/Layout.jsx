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
            // This is a new tab/window, logout
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        } else if (sessionId) {
            // Store in sessionStorage to track this tab
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
                        <div>
                            <h3 className="text-lemon font-bold mb-2">EcclesiaSys</h3>
                            <p className="text-white">A digital church designed to make your church management simple.</p>
                        </div>

                        <div>
                            <h3 className="text-lemon font-bold mb-2">Locations & Service Times</h3>
                            <ul className="text-white">
                                <li className="mb-2"><strong>Park District</strong> — Sunday 10:00 AM</li>
                                <li className="mb-2"><strong>Markham Woods</strong> — Sunday 9:00 AM & 11:00 AM</li>
                                <li className="mb-2"><strong>Deltona</strong> — Sunday 10:00 AM</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lemon font-bold mb-2">Newsletter</h3>
                            <p className="text-white mb-2">Sign up to receive news and updates.</p>
                            <form id="newsletter-form" onSubmit={(e) => { e.preventDefault(); const email = e.target.email.value; fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).then(r => { if (r.ok) { alert('Thanks — check your inbox.'); e.target.reset(); } else { alert('Subscription failed.'); } }).catch(()=>{ alert('Subscription failed.'); }); }} className="flex flex-col sm:flex-row gap-2">
                                <input aria-label="Email address" name="email" type="email" required placeholder="you@email.com" className="px-3 py-2 rounded-md text-tealDeep" />
                                <button type="submit" className="bg-accent text-primary px-3 py-2 rounded-md font-semibold">Sign Up</button>
                            </form>
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

