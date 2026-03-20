import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAnnouncements } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Announcements() {
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const location = useLocation();

    useEffect(() => {
        // Watchdog timeout to prevent indefinite loading
        const timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                if (announcements.length === 0) {
                    console.warn("Loading timed out for announcements.");
                }
            }
        }, 10000);

        getAnnouncements().then(response => {
            const data = response.data;
            const fetchedAnnouncements = data.data || data || [];
            setAnnouncements(Array.isArray(fetchedAnnouncements) ? fetchedAnnouncements : []);
            setLoading(false);
            clearTimeout(timer);

            // Check for id in query params
            const params = new URLSearchParams(location.search);
            const announcementId = params.get('id');
            if (announcementId) {
                setExpandedId(parseInt(announcementId));
                // Scroll to the announcement after a short delay
                setTimeout(() => {
                    const element = document.getElementById(`announcement-${announcementId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a temporary highlight class
                        element.classList.add('ring-4', 'ring-mdPrimary', 'transition-all', 'duration-1000');
                        setTimeout(() => {
                            element.classList.remove('ring-4', 'ring-mdPrimary');
                        }, 3000);
                    }
                }, 500);
            }
        }).catch(err => {
            console.error('Error fetching announcements:', err);
            setLoading(false);
            clearTimeout(timer);
        });

        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex justify-center flex-col items-center min-h-[50vh] animate-fade-in">
            <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin mb-4"></div>
            <div className="text-mdOnSurfaceVariant font-bold tracking-wide text-center">
                Loading announcements...<br/>
                <span className="text-xs opacity-50 font-medium uppercase tracking-widest">Checking the scrolls of wisdom</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 animate-fade-in pb-24">
                <div className="mb-10 sm:mb-14">
                    <button 
                        onClick={() => navigate(sessionStorage.getItem('userType') === 'admin' ? '/admin' : '/member-dashboard')}
                        className="w-max flex items-center gap-2 text-mdPrimary font-black hover:bg-mdPrimary/10 px-4 py-2 rounded-xl transition-all mb-6"
                    >
                        <FontAwesomeIcon icon={faBullhorn} className="rotate-90" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-mdPrimaryContainer p-3 sm:p-4 rounded-3xl shadow-sm">
                            <FontAwesomeIcon icon={faBullhorn} className="text-3xl sm:text-4xl text-mdPrimary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-mdOnSurface tracking-tight">
                            Announcements
                        </h1>
                    </div>
                </div>
                <p className="text-mdOnSurfaceVariant text-lg mb-8 sm:mb-12 font-medium">Stay informed with the latest updates from your community.</p>
                
                {announcements.length === 0 ? (
                    <div className="bg-mdSurfaceVariant/20 border-2 border-dashed border-mdOutline/20 p-20 rounded-[3rem] text-center">
                        <div className="w-20 h-20 bg-mdSurfaceVariant/50 rounded-full flex items-center justify-center mx-auto mb-6 text-mdOutline">
                            <FontAwesomeIcon icon={faBullhorn} className="text-3xl opacity-40" />
                        </div>
                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">No announcements found</h3>
                        <p className="text-mdOnSurfaceVariant text-lg">Check back later for new messages from the church family.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.map((announcement, index) => (
                            <div 
                                key={announcement.id || index} 
                                id={`announcement-${announcement.id}`} 
                                onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
                                className={`bg-mdSurface p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-500 group cursor-pointer relative overflow-hidden ${
                                    expandedId === announcement.id 
                                    ? 'border-mdPrimary shadow-premium ring-1 ring-mdPrimary/20 translate-x-2' 
                                    : 'border-mdSurfaceVariant shadow-sm hover:shadow-md1 hover:border-mdPrimary/30'
                                }`}
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-mdPrimary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-mdPrimary uppercase tracking-[0.2em] bg-mdPrimary/10 px-2 py-0.5 rounded-md">Notification</span>
                                            <span className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-widest">
                                                {new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className={`text-2xl sm:text-3xl font-black transition-colors duration-300 ${expandedId === announcement.id ? 'text-mdPrimary' : 'text-mdOnSurface'}`}>
                                            {announcement.title}
                                        </h3>
                                    </div>
                                    <div className={`p-3 rounded-full bg-mdSurfaceVariant/30 text-mdOnSurface font-black transition-transform duration-500 ${expandedId === announcement.id ? 'rotate-180 bg-mdPrimaryContainer text-mdPrimary' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                <div className={`transition-all duration-500 ease-in-out ${expandedId === announcement.id ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
                                    <p className={`text-mdOnSurfaceVariant text-lg leading-relaxed whitespace-pre-wrap ${expandedId === announcement.id ? '' : 'line-clamp-3'}`}>
                                        {announcement.message}
                                    </p>
                                    
                                    {expandedId === announcement.id && (
                                        <div className="mt-8 animate-fade-in">
                                            {announcement.fileUrl && (
                                                <div className="pt-6 border-t border-mdOutline/10">
                                                    <a
                                                        href={announcement.fileUrl}
                                                        download
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-3 bg-mdPrimary text-mdOnPrimary px-8 py-3.5 rounded-2xl font-black shadow-md1 hover:shadow-md2 hover:scale-[1.02] transition-all duration-300"
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} /> Download Attachment
                                                    </a>
                                                </div>
                                            )}
                                            
                                            <div className="mt-6 flex justify-end">
                                                <span className="text-xs font-bold text-mdOnSurfaceVariant/40 uppercase tracking-widest">End of announcement</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {expandedId !== announcement.id && (
                                    <div className="mt-4 flex items-center gap-1.5 text-mdPrimary font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                        Read full message <FontAwesomeIcon icon={faDownload} className="-rotate-90 text-[8px]" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
    );
}
