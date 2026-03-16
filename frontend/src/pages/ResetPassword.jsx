import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEye, faEyeSlash, faCheckCircle, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function ResetPassword() {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we're coming from ForgotPassword, we might have an email in state.
    // If we have a message from the redirect, we could show it, but the UI flow is self-explanatory enough.
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!resetCode || resetCode.length !== 6) {
      setError('Please enter a valid 6-digit reset code');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center animate-fade-in py-12 px-4">
        <div className="bg-mdSurface text-mdOnSurface p-10 rounded-[2.5rem] shadow-md2 w-full max-w-md border border-mdSurfaceVariant transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mdPrimaryContainer text-mdPrimary mb-5 shadow-sm">
              <FontAwesomeIcon icon={faKey} className="text-2xl" />
            </div>
            <h1 className="text-3xl font-extrabold text-mdOnSurface tracking-tight">
              Set New Password
            </h1>
            <p className="text-mdOnSurfaceVariant mt-3 font-medium">
              Enter your new password below.
            </p>
          </div>

          {message && (
            <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] px-5 py-4 rounded-2xl mb-6 font-semibold flex items-center gap-3 shadow-sm">
              <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 shrink-0" />
              {message}
            </div>
          )}

          {error && (
            <div className="bg-mdErrorContainer text-mdError px-5 py-4 rounded-2xl mb-6 font-semibold flex items-start gap-3 shadow-sm animate-shake">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 shrink-0 mt-0.5" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {location.state?.email && (
                <div className="bg-mdPrimaryContainer/30 border border-mdPrimaryContainer text-mdOnSurface px-5 py-3 rounded-2xl mb-4 font-medium text-sm text-center">
                  Resetting password for: <span className="font-bold text-mdPrimary">{location.state.email}</span>
                </div>
              )}

              <div className="relative">
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-Digit Reset Code"
                  className="w-full px-6 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 text-lg font-bold tracking-widest text-center"
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full px-6 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 text-lg peer"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-mdOnSurfaceVariant/60 hover:text-mdPrimary transition-colors p-2"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full px-6 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 text-lg peer"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-mdOnSurfaceVariant/60 hover:text-mdPrimary transition-colors p-2"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold py-4 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                    </span>
                ) : 'Reset Password'}
              </button>
            </form>
          ) : null}

          {success && (
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-mdSecondary hover:bg-mdSecondary/90 text-mdOnSecondary font-bold py-4 px-6 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Return to Login
              </Link>
            </div>
          )}
          
          {!success && (
            <div className="text-center mt-6">
              <Link
                to="/forgot-password"
                className="text-mdPrimary font-bold hover:text-mdSecondary transition-colors"
              >
                Request a new reset code
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
