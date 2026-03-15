import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [actualEmail, setActualEmail] = useState('');
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
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, actualEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        
        // Use a timeout to redirect to ResetPassword with the email pre-filled
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 3000);
      } else {
        setError(data.message || 'Failed to process password reset request');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="bg-mdSurface text-mdOnSurface p-10 rounded-3xl shadow-md2 w-full max-w-md border border-mdSurfaceVariant">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mdPrimaryContainer text-mdPrimary mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-mdPrimary tracking-tight">
            Reset Password
          </h1>
          <p className="text-mdOnSurfaceVariant mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message && (
          <div className="bg-mdPrimaryContainer/50 border border-mdPrimaryContainer text-mdPrimary px-4 py-3 rounded-2xl mb-6 text-sm font-medium text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-mdErrorContainer text-mdError px-4 py-3 rounded-2xl mb-6 text-sm font-bold text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">
              System Login Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jdoe123@ecclesiasys.com"
              className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">
              Personal Web Email
            </label>
            <input
              type="email"
              value={actualEmail}
              onChange={(e) => setActualEmail(e.target.value)}
              placeholder="e.g. john.doe@gmail.com"
              className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
              required
              disabled={loading}
            />
            <p className="text-xs text-mdOutline mt-2 ml-1">A 6-digit code will be sent to this email.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold py-4 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-mdSurfaceVariant text-center">
          <p className="text-mdOnSurfaceVariant text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-mdPrimary font-extrabold hover:text-mdSecondary transition-colors duration-200">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
