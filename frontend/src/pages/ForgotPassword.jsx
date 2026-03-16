import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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
        <div className="text-center mb-8 relative">
          <Link to="/login" className="absolute left-0 top-1/2 -translate-y-1/2 text-mdOutline hover:text-mdPrimary transition-colors flex items-center gap-1 text-sm font-bold">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Login
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mdPrimaryContainer text-mdPrimary mb-4 shadow-sm mx-auto">
            <FontAwesomeIcon icon={faKey} className="text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-mdPrimary tracking-tight">
            Reset Password
          </h1>
          <p className="text-mdOnSurfaceVariant mt-2">
            Enter your email address and we'll send you a 6-digit code to reset your password.
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
              Registered Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mdOutline">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john.doe@gmail.com"
                className="w-full pl-11 pr-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-mdOutline mt-2 ml-1">The reset code will be sent to this email.</p>
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
