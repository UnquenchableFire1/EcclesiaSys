import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAnnouncements } from '../services/api';
import Layout from '../layouts/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        getAnnouncements().then(response => {
            const data = response.data;
            const fetchedAnnouncements = data.data || data || [];
            setAnnouncements(Array.isArray(fetchedAnnouncements) ? fetchedAnnouncements : []);
            setLoading(false);

            // Check for id in query params
            const params = new URLSearchParams(location.search);
            const announcementId = params.get('id');
            if (announcementId) {
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
        });
    }, []);

    if (loading) return (
        <Layout>
            <div className="flex justify-center flex-col items-center min-h-[50vh] animate-fade-in">
                <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin mb-4"></div>
                <div className="text-mdOnSurfaceVariant font-bold tracking-wide">Loading announcements...</div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-mdPrimaryContainer p-3 sm:p-4 rounded-2xl">
                        <FontAwesomeIcon icon={faBullhorn} className="text-3xl sm:text-4xl text-mdPrimary" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-mdOnSurface tracking-tight">Announcements</h1>
                </div>
                <p className="text-mdOnSurfaceVariant text-lg mb-8 sm:mb-12 font-medium">Latest news and updates from EcclesiaSys</p>
                
                {announcements.length === 0 ? (
                    <div className="bg-mdSurfaceVariant/30 border border-mdOutline/20 p-10 rounded-3xl text-center">
                        <FontAwesomeIcon icon={faBullhorn} className="text-5xl mb-4 text-mdOutline" />
                        <h3 className="text-xl font-bold text-mdOnSurface mb-2">No announcements yet</h3>
                        <p className="text-mdOnSurfaceVariant">Check back soon for updates from the church!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.map((announcement, index) => (
                            <div key={announcement.id || index} id={`announcement-${announcement.id}`} className="bg-mdSurface p-6 sm:p-8 rounded-3xl border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all duration-300 group">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <h3 className="text-2xl font-extrabold text-mdOnSurface group-hover:text-mdPrimary transition-colors">{announcement.title}</h3>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-mdSurfaceVariant text-mdOnSurfaceVariant text-sm font-bold whitespace-nowrap">
                                        {new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-mdOnSurfaceVariant leading-relaxed mb-6 whitespace-pre-wrap">{announcement.message}</p>
                                
                                {announcement.fileUrl && (
                                    <div className="pt-4 border-t border-mdSurfaceVariant/50">
                                        <a
                                            href={announcement.fileUrl}
                                            download
                                            className="inline-flex items-center gap-2 bg-mdPrimaryContainer/50 hover:bg-mdPrimary text-mdPrimary hover:text-mdOnPrimary px-5 py-2.5 rounded-full font-bold transition-all duration-300"
                                        >
                                            <FontAwesomeIcon icon={faDownload} /> Download File
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
