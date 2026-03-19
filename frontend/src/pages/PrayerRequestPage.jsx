import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrayingHands, faCheckCircle, faExclamationCircle, faUserSecret, faUser, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { submitPrayerRequest } from '../services/api';
import Layout from '../layouts/Layout';

export default function PrayerRequestPage() {
    const [formData, setFormData] = useState({
        requesterName: sessionStorage.getItem('userName') || '',
        email: sessionStorage.getItem('userEmail') || '',
        requestText: '',
        isAnonymous: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

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
        <Layout>
            <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <a href="/member-dashboard" className="w-10 h-10 rounded-full bg-mdSurfaceVariant/50 flex items-center justify-center text-mdPrimary hover:bg-mdPrimary hover:text-white transition-all">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </a>
                    <div>
                        <h1 className="text-4xl font-black text-mdPrimary tracking-tight">Request Prayer</h1>
                        <p className="text-mdOnSurfaceVariant font-medium">How can we pray for you today?</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-mdSurface rounded-[2.5rem] shadow-premium border border-mdOutline/10 overflow-hidden">
                    <div className="bg-mdPrimary p-8 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                                <FontAwesomeIcon icon={faPrayingHands} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Join Us in Prayer</h2>
                                <p className="text-white/80 font-medium">Our intercessory team is dedicated to praying with you.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {message.text ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-md ${message.isError ? 'bg-mdErrorContainer text-mdError' : 'bg-mdPrimaryContainer text-mdPrimary'}`}>
                                    <FontAwesomeIcon icon={message.isError ? faExclamationCircle : faCheckCircle} className="text-5xl" />
                                </div>
                                <h3 className="text-2xl font-black text-mdOnSurface mb-3">
                                    {message.isError ? 'Oops!' : 'Request Received'}
                                </h3>
                                <p className="text-lg text-mdOnSurfaceVariant max-w-sm mx-auto font-medium mb-8">{message.text}</p>
                                <button 
                                    onClick={() => setMessage({ text: '', isError: false })}
                                    className="bg-mdPrimary hover:bg-mdSecondary text-white font-black px-10 py-4 rounded-2xl transition-all shadow-md2 active:scale-95"
                                >
                                    Submit Another Request
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-mdOnSurfaceVariant ml-2 uppercase tracking-wide">Name</label>
                                        <input 
                                            type="text"
                                            placeholder="Your Name"
                                            value={formData.requesterName}
                                            onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                                            className="w-full bg-mdSurfaceVariant/20 border border-mdOutline/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-mdPrimary focus:border-transparent outline-none transition-all font-bold text-mdOnSurface"
                                            disabled={formData.isAnonymous}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-mdOnSurfaceVariant ml-2 uppercase tracking-wide">Email</label>
                                        <input 
                                            type="email"
                                            placeholder="Your Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-mdSurfaceVariant/20 border border-mdOutline/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-mdPrimary focus:border-transparent outline-none transition-all font-bold text-mdOnSurface"
                                            disabled={formData.isAnonymous}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-mdOnSurfaceVariant ml-2 uppercase tracking-wide">Your Prayer Request</label>
                                    <textarea 
                                        rows="6"
                                        placeholder="Write your prayer request here... Feel free to share as much detail as you're comfortable with."
                                        value={formData.requestText}
                                        onChange={(e) => setFormData({...formData, requestText: e.target.value})}
                                        className="w-full bg-mdSurfaceVariant/20 border border-mdOutline/10 rounded-[2rem] px-6 py-5 focus:ring-2 focus:ring-mdPrimary focus:border-transparent outline-none transition-all font-bold text-mdOnSurface resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-between bg-mdSurfaceVariant/20 p-6 rounded-[2rem] border border-mdOutline/5">
                                    <div className="flex items-center gap-4 text-mdOnSurface">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.isAnonymous ? 'bg-mdPrimary text-white shadow-md' : 'bg-mdSurfaceVariant/40 text-mdOutline'}`}>
                                            <FontAwesomeIcon icon={formData.isAnonymous ? faUserSecret : faUser} className="text-xl" />
                                        </div>
                                        <div>
                                            <span className="font-black block leading-none mb-1">Submit Anonymous?</span>
                                            <span className="text-xs font-bold text-mdOnSurfaceVariant">Your details won't be visible to others.</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.isAnonymous}
                                            onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-14 h-7 bg-mdOutline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mdPrimary"></div>
                                    </label>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-black text-xl rounded-[2rem] shadow-md2 hover:shadow-md3 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 mt-4 group"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Sending Request...</span>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPrayingHands} className="group-hover:rotate-12 transition-transform" />
                                            Submit Prayer Request
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
