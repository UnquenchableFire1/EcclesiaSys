import { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import Layout from '../layouts/Layout';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEvents().then(response => {
            setEvents(response.data || []);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching events:', err);
            setLoading(false);
        });
    }, []);

    if (loading) return <Layout><div className="text-center py-8 text-lemon font-semibold">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8">
                <h1 className="text-4xl font-bold mb-2 text-lemon">📅 Church Events</h1>
                <p className="text-white mb-8">Join us for our upcoming services and community events</p>
                {events.length === 0 ? (
                    <div className="bg-teal-800 border-l-4 border-lemon p-8 rounded-lg text-center">
                        <p className="text-white text-lg">No events scheduled yet.</p>
                        <p className="text-gray-300 mt-2">Subscribe to our newsletter to be notified of upcoming events!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((event, index) => (
                            <div key={event.id || index} className="bg-teal-800 p-6 rounded-lg border-l-4 border-lemon shadow-md hover:shadow-lg transition">
                                <h3 className="text-2xl font-semibold text-lemon mb-3">{event.eventName}</h3>
                                <p className="text-white mb-2">
                                    <span className="font-semibold text-lemon">📅 Date:</span> {new Date(event.eventDate).toLocaleDateString()}
                                </p>
                                <p className="text-white mb-2">
                                    <span className="font-semibold text-lemon">⏰ Time:</span> {event.eventTime}
                                </p>
                                <p className="text-white mb-4">
                                    <span className="font-semibold text-lemon">📍 Location:</span> {event.eventLocation}
                                </p>
                                <p className="text-white">{event.eventDescription}</p>
                                {event.documentUrl && (
                                    <div className="mt-4 pt-4 border-t border-teal-600">
                                        <a
                                            href={event.documentUrl}
                                            download
                                            className="inline-block bg-lemon text-tealDeep px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition text-sm"
                                        >
                                            📥 Download Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}}
            </div>
        </Layout>
    );
}

