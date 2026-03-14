import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import Layout from '../layouts/Layout';
import analytics from '../services/analyticsTracker';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        actualEmail: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Prevent double submission
        if (isSubmitting) {
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            analytics.trackError('Registration Validation Error', { reason: 'Passwords do not match' });
            return;
        }

        try {
            setIsSubmitting(true);
            analytics.trackUserAction('Register Attempt', { email: formData.actualEmail });
            // send the form data
            const response = await register(formData);
            if (response.data?.success) {
                const generatedEmail = response.data.email;
                // save credentials
                localStorage.setItem('memberEmail', generatedEmail);
                // auto-login as member
                if (response.data.userId) {
                    localStorage.setItem('userId', response.data.userId);
                    localStorage.setItem('userType', 'member');
                    localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
                    localStorage.setItem('sessionId', Date.now().toString());
                    localStorage.setItem('isNewMember', 'true');
                }
                analytics.trackUserAction('User Registration Successful', { email: generatedEmail });
                alert(`WELCOME TO ECCLESIASYS CHURCH MANAGEMENT SYSTEM. YOUR LOGIN EMAIL IS "${generatedEmail}" USE THIS ANYTIME LOGGING IN`);
                // navigate to member dashboard
                navigate('/member-dashboard');
            } else {
                setError(response.data?.message || 'Registration failed');
                analytics.trackError('Registration Failed', { message: response.data?.message });
            }
        } catch (err) {
            console.error('Registration error', err);
            const msg = err.response?.data?.message || err.message || 'Network error';
            setError(msg);
            analytics.trackError('Registration Error', { message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-yellow-50 py-12 px-4">
                <div className="w-full max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-tealDeep mb-2">✨ Join Us</h1>
                        <p className="text-xl text-gray-600">Create your church member account</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-lemon">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                                <p className="font-semibold text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">First Name</label>
                                <input 
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Last Name</label>
                                <input 
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                                    placeholder="Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Phone Number</label>
                                <input 
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                                    placeholder="(123) 456-7890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Personal Email</label>
                                <input 
                                    type="email"
                                    name="actualEmail"
                                    value={formData.actualEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                                    placeholder="your@email.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">✉️ For password reset links only</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 text-lg transition"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 text-lg transition"
                                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-blue-700 text-sm">
                                <p className="font-semibold">📧 A login email will be auto-generated for you!</p>
                                <p className="text-xs mt-1">Keep it safe - you'll use it to login.</p>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-tealDeep to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 rounded-lg transition shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? '⏳ Creating Account...' : '✨ Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-center text-gray-600 text-sm">
                                Already have an account? <a href="/login" className="text-tealDeep font-semibold hover:text-lemon transition">Login here</a>
                            </p>
                        </div>
                    </div>

                    {/* Footer Info */}
                </div>
            </div>
        </Layout>
    );
}

