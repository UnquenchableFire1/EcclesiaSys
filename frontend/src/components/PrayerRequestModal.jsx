import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrayingHands, faTimes, faCheckCircle, faExclamationCircle, faUserSecret, faUser } from '@fortawesome/free-solid-svg-icons';
import { submitPrayerRequest } from '../services/api';

export default function PrayerRequestModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        requesterName: sessionStorage.getItem('userName') || '',
        email: sessionStorage.getItem('memberEmail') || '',
        requestText: '',
        isAnonymous: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.requestText.trim()) return;

        setIsSubmitting(true);
        setMessage({ text: '', isError: false });

        try {
            const response = await submitPrayerRequest(formData);
            if (response.data?.success) {
                setMessage({ text: 'Your prayer request has been submitted. We will pray with you.', isError: false });
                setFormData(prev => ({ ...prev, requestText: '' }));
                setTimeout(() => {
                    onClose();
                    setMessage({ text: '', isError: false });
                }, 3000);
            } else {
                setMessage({ text: response.data?.message || 'Failed to submit request.', isError: true });
            }
        } catch (err) {
            setMessage({ text: 'Network error. Please try again.', isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card max-w-lg w-full overflow-hidden animate-slide-up relative">
                {/* Header */}
                <div className="bg-mdPrimary p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Request Prayer</h2>
                            <p className="text-white/80 text-sm font-medium">How can we pray for you today?</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {message.text ? (
                        <div className={`flex flex-col items-center justify-center py-10 text-center animate-fade-in`}>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${message.isError ? 'bg-mdErrorContainer text-mdError' : 'bg-mdPrimaryContainer text-mdPrimary'}`}>
                                <FontAwesomeIcon icon={message.isError ? faExclamationCircle : faCheckCircle} className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold text-mdOnSurface mb-2">
                                {message.isError ? 'Oops!' : 'Submitted'}
                            </h3>
                            <p className="text-mdOnSurfaceVariant max-w-xs mx-auto font-medium">{message.text}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-mdOnSurfaceVariant ml-1">Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Your Name"
                                        value={formData.requesterName}
                                        onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                                        className="w-full bg-white/50 border border-mdOutline/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-mdPrimary focus:border-transparent outline-none transition-all font-medium"
                                        disabled={formData.isAnonymous}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-mdOnSurfaceVariant ml-1">Email</label>
                                    <input 
                                        type="email"
                                        placeholder="Your Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/50 border border-mdOutline/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-mdPrimary focus:border-transparent outline-none transition-all font-medium"
                                        disabled={formData.isAnonymous}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-mdOnSurfaceVariant ml-1">Your Prayer Request</label>
                                <textarea 
                                    rows="4"
                                    placeholder="Write your prayer request here..."
                                    value={formData.requestText}
                                    onChange={(e) => setFormData({...formData, requestText: e.target.value})}
                                    className="w-full bg-white/50 border border-mdOutline/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-mdPrimary focus:border-transparent outline-none transition-all font-medium resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-between bg-mdSurfaceVariant/30 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 text-mdOnSurface">
                                    <FontAwesomeIcon icon={formData.isAnonymous ? faUserSecret : faUser} className="opacity-60" />
                                    <span className="font-bold text-sm">Submit Anonymous?</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.isAnonymous}
                                        onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-mdOutline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mdPrimary"></div>
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-black rounded-2xl shadow-md2 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Submitting...</span>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPrayingHands} />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
