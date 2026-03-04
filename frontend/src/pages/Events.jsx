import { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import Layout from '../layouts/Layout';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEvents().then(data => {
            setEvents(data);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching events:', err);
            setLoading(false);
        });
    }, []);

    if (loading) return <Layout><div className="text-center py-8 text-tealDeep font-semibold">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-tealDeep">📅 Church Events</h1>
                <p className="text-gray-600 mb-8">Join us for our upcoming services and community events</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event, index) => (
                        <div key={event.id || index} className="bg-white p-6 rounded-lg border-l-4 border-tealDeep shadow-md hover:shadow-lg transition">
                            <h3 className="text-2xl font-semibold text-tealDeep mb-3">{event.eventName}</h3>
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold text-tealDeep">📅 Date:</span> {new Date(event.eventDate).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold text-tealDeep">⏰ Time:</span> {event.eventTime}
                            </p>
                            <p className="text-gray-600 mb-4">
                                <span className="font-semibold text-tealDeep">📍 Location:</span> {event.eventLocation}
                            </p>
                            <p className="text-gray-700">{event.eventDescription}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

