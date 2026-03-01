import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar isMobile={isMobile} />
            <main className='pt-16 md:pt-20'>
                <div className='p-4 md:p-6 lg:p-8'>
                    {children}
                </div>
            </main>
            <footer className="mt-12 bg-tealDeep text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2026 BBJ Church Manager. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
