import { useEffect, useState } from 'react';
import { getSermons } from '../services/api';
import Layout from '../layouts/Layout';

export default function Sermons() {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSermons().then(data => {
            setSermons(data);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching sermons:', err);
            setLoading(false);
        });
    }, []);

    if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Sermons</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sermons.map((sermon, index) => (
                        <div key={sermon.id || index} className="bg-yellow-50 p-6 rounded-lg border border-yellow-300 shadow-md hover:shadow-lg transition">
                            <h3 className="text-2xl font-semibold text-yellow-700 mb-2">{sermon.title}</h3>
                            <p className="text-gray-700 mb-4">{sermon.description}</p>
                            <p className="text-sm text-gray-600 mb-3">
                                <span className="font-semibold">Speaker:</span> {sermon.speaker}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                <span className="font-semibold">Date:</span> {new Date(sermon.sermonDate).toLocaleDateString()}
                            </p>
                            {sermon.audioUrl && (
                                <div className="mb-3">
                                    <audio controls className="w-full">
                                        <source src={sermon.audioUrl} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}
                            {sermon.videoUrl && (
                                <div className="mb-3">
                                    <video controls className="w-full max-h-48">
                                        <source src={sermon.videoUrl} type="video/mp4" />
                                        Your browser does not support the video element.
                                    </video>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
