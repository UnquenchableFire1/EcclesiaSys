import { useState, useEffect, useMemo } from 'react';
import { getAnnouncements } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faClock, faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function Announcements({ embedded = false }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await getAnnouncements();
                const data = response.data?.data || response.data || [];
                setAnnouncements(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(ann => 
            ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ann.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [announcements, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-12'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">Church News</h1>
                        <p className="text-mdPrimary font-black text-lg uppercase tracking-widest bg-mdPrimary/5 px-4 py-1 rounded-full w-max">
                            Announcements
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center ${embedded ? 'mt-4' : ''}`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-bold text-sm uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faBullhorn} className="text-mdPrimary" />
                    <span>{filteredAnnouncements.length} Total</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="glass-card h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="glass-card p-20 text-center">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faBullhorn} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">No announcements found</p>
                    <p className="text-mdOnSurfaceVariant font-medium">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredAnnouncements.map((ann) => (
                        <div key={ann.id} className="glass-card group overflow-hidden flex flex-col">
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-4 py-1.5 rounded-full bg-mdPrimary/10 text-mdPrimary text-[10px] font-black uppercase tracking-widest">
                                        Announcement
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-mdOutline uppercase tracking-widest">
                                        <FontAwesomeIcon icon={faClock} className="opacity-50" />
                                        {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-mdOnSurface mb-4 group-hover:text-mdPrimary transition-colors line-clamp-2">
                                    {ann.title}
                                </h3>
                                <p className="text-mdOnSurfaceVariant font-medium leading-relaxed mb-6 line-clamp-3">
                                    {ann.message}
                                </p>
                            </div>
                            <div className="px-8 py-5 bg-mdSurfaceVariant/10 border-t border-mdOutline/5 flex items-center justify-between">
                                <button className="text-sm font-black text-mdPrimary hover:underline uppercase tracking-widest flex items-center gap-2">
                                    Read Full Story
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-[10px]" />
                                </button>
                                {ann.isUrgent && (
                                    <span className="w-2 h-2 bg-mdError rounded-full animate-ping"></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
