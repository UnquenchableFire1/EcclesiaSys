import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import Layout from '../layouts/Layout';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [error, setError] = useState('');
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
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('memberId', response.memberId);
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Registration failed');
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
                        <h1 className="text-4xl font-bold text-tealDeep mb-2">Join BBJ Church</h1>
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
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Full Name</label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Email Address</label>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Phone (Optional)</label>
                                <input 
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Password</label>
                                <input 
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Confirm Password</label>
                                <input 
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="••••••••"
                                />
                            </div>

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
                    <p className="text-center text-gray-500 text-xs mt-6">© 2026 BBJ Church Manager</p>
                </div>
            </div>
        </Layout>
    );
}

