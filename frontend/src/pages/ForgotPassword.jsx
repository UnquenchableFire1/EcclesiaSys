import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import analytics from '../services/analyticsTracker';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      analytics.trackUserAction('Password Reset Attempt', { email });
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail('');
        analytics.trackUserAction('Password Reset Email Sent', { email });
        // Show reset token if available (for testing/development)
        if (data.resetToken) {
          setMessage(data.message + ` Reset Token: ${data.resetToken}`);
        }
        // Optionally redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to process password reset request');
        analytics.trackError('Password Reset Failed', { message: data.message });
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      analytics.trackError('Password Reset Error', { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-yellow-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-tealDeep mb-2">🔑 Reset Password</h1>
            <p className="text-xl text-gray-600">We'll send you a reset link</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-lemon">
            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-semibold text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lemon focus:ring-2 focus:ring-yellow-100 transition"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-tealDeep to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
              </button>
            </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="font-bold" style={{ color: '#0f4c5c' }}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
      </div>
    </Layout>
  );
}
