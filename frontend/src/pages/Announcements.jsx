import { useEffect, useState } from 'react';
import { getAnnouncements } from '../services/api';
import Layout from '../layouts/Layout';
import analytics from '../services/analyticsTracker';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analytics.trackPageView('Announcements');
        getAnnouncements().then(response => {
            setAnnouncements(response.data || []);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching announcements:', err);
            analytics.trackError('Failed to load announcements', 'API_ERROR');
            setLoading(false);
        });
    }, []);

    if (loading) return <Layout><div className="text-center py-12 text-lemon font-semibold text-lg">Loading announcements...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-3 text-white"><span className="text-lemon">📢</span> Church Announcements</h1>
                    <p className="text-xl text-gray-300">Stay connected with the latest news and updates from our community</p>
                </div>
                {announcements.length === 0 ? (
                    <div className="bg-gradient-to-r from-teal-700 to-teal-900 border-l-4 border-lemon p-12 rounded-lg text-center shadow-lg">
                        <p className="text-white text-xl mb-2">📢 No announcements yet</p>
                        <p className="text-gray-300">Check back soon for updates from our community!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.map((announcement, index) => (
                            <div key={announcement.id || index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border-l-4 border-lemon">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-3xl font-bold text-tealDeep flex-1">{announcement.title}</h3>
                                        <span className="text-sm font-semibold text-lemon bg-yellow-50 px-3 py-1 rounded-full">
                                            {new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-lg leading-relaxed mb-4">{announcement.message}</p>
                                    {announcement.fileUrl && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <a
                                                href={announcement.fileUrl}
                                                download
                                                onClick={() => analytics.trackUserAction('DOWNLOAD', { type: 'ANNOUNCEMENT' })}
                                                className="inline-flex items-center bg-lemon hover:bg-yellow-300 text-tealDeep px-6 py-2 rounded-lg font-semibold transition"
                                            >
                                                📥 Download File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

