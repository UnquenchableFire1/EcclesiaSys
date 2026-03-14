import { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import Layout from '../layouts/Layout';
import Hero from '../components/Hero';
import analytics from '../services/analyticsTracker';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analytics.trackPageView('Events');
        getEvents().then(response => {
            setEvents(response.data || []);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching events:', err);
            analytics.trackError('Failed to load events', 'API_ERROR');
            setLoading(false);
        });
    }, []);

    if (loading) return <Layout><div className="text-center py-12 text-lemon font-semibold text-lg">Loading events...</div></Layout>;

    return (
        <Layout>
            <Hero
                title={<><span className="text-lemon">📅</span> Church Events</>}
                subtitle="Join us for our upcoming services and community events"
                ctaText="See All Events"
                ctaLink="/events"
                bgImage="/hero-events.jpg"
            />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-12">
                    {/* Hero */}
                </div>
                {events.length === 0 ? (
                    <div className="bg-gradient-to-r from-teal-700 to-teal-900 border-l-4 border-lemon p-12 rounded-lg text-center shadow-lg">
                        <p className="text-white text-xl mb-2">📅 No events scheduled</p>
                        <p className="text-gray-300">Subscribe to our newsletter to be notified of upcoming events!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((event, index) => (
                            <div key={event.id || index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-lemon h-full flex flex-col">
                                <div className="bg-gradient-to-r from-lemon to-yellow-300 p-6">
                                    <h3 className="text-2xl font-bold text-tealDeep">{event.eventName}</h3>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-3 mb-4">
                                        <p className="text-gray-700 flex items-center">
                                            <span className="font-semibold text-lemon mr-3">📅</span>
                                            <span>{new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        </p>
                                        <p className="text-gray-700 flex items-center">
                                            <span className="font-semibold text-lemon mr-3">⏰</span>
                                            <span>{event.eventTime}</span>
                                        </p>
                                        <p className="text-gray-700 flex items-center">
                                            <span className="font-semibold text-lemon mr-3">📍</span>
                                            <span>{event.eventLocation}</span>
                                        </p>
                                    </div>
                                    <p className="text-gray-600 flex-1 mb-4">{event.eventDescription}</p>
                                    {event.documentUrl && (
                                        <div>
                                            <a
                                                href={event.documentUrl}
                                                download
                                                onClick={() => analytics.trackUserAction('DOWNLOAD', { type: 'EVENT_DOCUMENT' })}
                                                className="inline-flex items-center bg-lemon hover:bg-yellow-300 text-tealDeep px-4 py-2 rounded-lg font-semibold transition text-sm"
                                            >
                                                📥 Download Document
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

