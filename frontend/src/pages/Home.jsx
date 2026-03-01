import { useEffect, useState } from 'react';
import { getEvents, getAnnouncements } from '../services/api';
import Layout from '../layouts/Layout';

export default function Home() {
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getEvents(), getAnnouncements()])
            .then(([eventData, announcementData]) => {
                setEvents(eventData.slice(0, 3));
                setAnnouncements(announcementData.slice(0, 3));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-blue-800 mb-4">Welcome to BBJ Church Manager</h1>
                    <p className="text-xl text-gray-700">Stay connected with your church community</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
                        <h2 className="text-3xl font-bold text-blue-800 mb-4">Upcoming Events</h2>
                        <div className="space-y-4">
                            {events.length > 0 ? (
                                events.map((event, index) => (
                                    <div key={event.id || index} className="bg-white p-4 rounded-md shadow-md">
                                        <h3 className="font-semibold text-blue-700">{event.eventName}</h3>
                                        <p className="text-sm text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No upcoming events.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg">
                        <h2 className="text-3xl font-bold text-green-800 mb-4">Recent Announcements</h2>
                        <div className="space-y-4">
                            {announcements.length > 0 ? (
                                announcements.map((announcement, index) => (
                                    <div key={announcement.id || index} className="bg-white p-4 rounded-md shadow-md">
                                        <h3 className="font-semibold text-green-700">{announcement.title}</h3>
                                        <p className="text-sm text-gray-600 truncate">{announcement.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No announcements.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-800 text-white p-8 rounded-lg text-center">
                    <h3 className="text-2xl font-bold mb-2">Get Involved</h3>
                    <p className="mb-4">Join us for our upcoming events and services</p>
                    <a href="/events" className="bg-white text-blue-800 font-bold px-6 py-2 rounded hover:bg-gray-100 transition">
                        View All Events
                    </a>
                </div>
            </div>
        </Layout>
    );
}
