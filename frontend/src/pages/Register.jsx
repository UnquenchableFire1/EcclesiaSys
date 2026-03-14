import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import Layout from '../layouts/Layout';

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
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
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
                    localStorage.setItem('isNewMember', 'true');
                }
                alert(`WELCOME TO ECCLESIASYS CHURCH MANAGEMENT SYSTEM. YOUR LOGIN EMAIL IS "${generatedEmail}" USE THIS ANYTIME LOGGING IN`);
                // navigate to member dashboard
                navigate('/member-dashboard');
            } else {
                setError(response.data?.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error', err);
            const msg = err.response?.data?.message || err.message || 'Network error';
            setError(msg);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-lemon rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-3xl font-bold text-tealDeep">+</span>
                        </div>
                        <h1 className="text-4xl font-bold text-tealDeep mb-2">Join EcclesiaSys Church Management System</h1>
                        <p className="text-gray-600">Create your member account</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-lemon">
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                                {error}
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="your.email@example.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">This email will be used to send you password reset links</p>
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
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-600 hover:text-gray-800"
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
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3.5 text-gray-600 hover:text-gray-800"
                                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm">
                                An email will be automatically generated for you after registration. Please save it for logging in.
                            </p>

                            <button 
                                type="submit"
                                className="w-full bg-lemon text-tealDeep font-bold py-3 rounded-lg hover:bg-yellow-400 transition shadow-lg mt-6"
                            >
                                Create Account
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

