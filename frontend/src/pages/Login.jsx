import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import Layout from '../layouts/Layout';

export default function Login() {
    const [email, setEmail] = useState('benjamin@bbj.com');
    const [password, setPassword] = useState('fire@123');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await login(email, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('memberId', response.memberId);
            navigate(response.role === 'admin' ? '/admin' : '/home');
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-lemon rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-3xl font-bold text-tealDeep">✓</span>
                        </div>
                        <h1 className="text-4xl font-bold text-tealDeep mb-2">BBJ Church</h1>
                        <p className="text-gray-600">Member Login</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-tealDeep">
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Email Address</label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-tealDeep mb-2">Password</label>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-1 focus:ring-lemon transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-tealDeep text-white font-bold py-3 rounded-lg hover:bg-teal-800 transition shadow-lg"
                            >
                                Login
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-center text-gray-600 text-sm">
                                Don't have an account? <a href="/register" className="text-tealDeep font-semibold hover:text-lemon transition">Register here</a>
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

