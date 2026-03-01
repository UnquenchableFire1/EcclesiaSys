import { useEffect, useState } from 'react';
import { getAnnouncements } from '../services/api';
import Layout from '../layouts/Layout';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnnouncements().then(data => {
            setAnnouncements(data);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching announcements:', err);
            setLoading(false);
        });
    }, []);

    if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Church Announcements</h1>
                <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                        <div key={announcement.id || index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition">
                            <h3 className="text-2xl font-semibold text-blue-600 mb-3">{announcement.title}</h3>
                            <p className="text-gray-700">{announcement.message}</p>
                            <p className="text-sm text-gray-500 mt-4">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
