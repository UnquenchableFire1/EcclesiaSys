
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import Layout from '../layouts/Layout';
import analytics from '../services/analyticsTracker';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password);
      if (response.data?.success) {
        const data = response.data;
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('sessionId', Date.now().toString());
        analytics.trackUserAction('User Login', { userType: data.userType });
        if (data.userType === 'admin') {
          navigate('/admin');
        } else if (data.userType === 'member') {
          navigate('/member-dashboard');
        }
      } else {
        setError('Account does not exist');
        analytics.trackError('Login Failed', { reason: 'Account does not exist' });
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Account does not exist');
      analytics.trackError('Login Error', { message: err.message });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-yellow-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-tealDeep mb-2">🔐 Login</h1>
            <p className="text-xl text-gray-600">Access your church portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-lemon">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                    required
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

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-tealDeep to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 rounded-lg transition shadow-md mt-6"
              >
                🚪 Login Now
              </button>
            </form>

            {/* Links Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <div className="text-center">
                <a href="/forgot-password" className="text-tealDeep font-semibold hover:text-lemon transition text-sm">
                  Forgot your password?
                </a>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">
                  Don't have an account?
                </p>
                <a href="/register" className="text-lemon font-bold hover:text-tealDeep transition">
                  Create an account →
                </a>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-lemon to-yellow-200 rounded-lg p-6 text-center">
            <p className="text-tealDeep font-semibold text-sm">
              📱 For troubleshooting or account access issues, please contact admin@ecclesiasys.com
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
