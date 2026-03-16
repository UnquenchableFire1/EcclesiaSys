import { useState, useEffect } from 'react';
import { getPublicMembers } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faEnvelope, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function MemberDirectory() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPublicMembers();
    }, []);

    const fetchPublicMembers = async () => {
        try {
            const response = await getPublicMembers();
            if (response.data.success) {
                setMembers(response.data.data);
            } else {
                setError('Failed to load member directory');
            }
        } catch (err) {
            setError('Error loading directory: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Loading directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                    <FontAwesomeIcon icon={faUser} className="text-2xl text-mdPrimary" />
                </div>
                <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">Member Directory</h2>
            </div>

            {error && (
                <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-3xl mb-6">
                    {error}
                </div>
            )}

            {members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((member) => {
                        const firstName = member.firstName || 'Member';
                        const lastName = member.lastName || '';
                        const initial = firstName.charAt(0).toUpperCase();

                        return (
                            <div key={member.id} className="bg-mdSurface p-6 rounded-[2rem] border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden">
                                <div className="w-24 h-24 mb-4 rounded-full bg-mdSurfaceVariant overflow-hidden border-4 border-mdSurface shadow-md relative group-hover:scale-105 transition-transform duration-300">
                                    {member.profilePictureUrl ? (
                                        <img src={member.profilePictureUrl} alt={`${firstName}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-mdPrimary bg-mdPrimaryContainer">
                                            {initial}
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="text-lg font-extrabold text-mdOnSurface mb-1">
                                    {firstName} {lastName}
                                </h3>
                                
                                {member.bio && (
                                    <p className="text-sm text-mdOnSurfaceVariant line-clamp-2 mb-4">
                                        {member.bio}
                                    </p>
                                )}

                                <div className="w-full space-y-2 text-left mt-auto bg-mdSurfaceVariant/30 p-4 rounded-2xl">
                                    {member.phoneNumber && (
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={faPhone} className="text-mdSecondary text-xs" />
                                            <p className="text-xs font-bold text-mdOnSurface truncate">{member.phoneNumber}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-mdPrimary text-xs" />
                                        <p className="text-xs font-bold text-mdOnSurface truncate">{member.actualEmail || member.email}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-mdSurfaceVariant/30 border border-mdSurfaceVariant rounded-3xl p-12 text-center">
                    <p className="text-mdOnSurfaceVariant text-lg font-medium">No public profiles available yet.</p>
                </div>
            )}
        </div>
    );
}
