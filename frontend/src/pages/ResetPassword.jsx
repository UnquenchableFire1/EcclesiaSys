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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden animate-fade-in">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-mdPrimary via-mdSurface to-mdSecondary/20"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="glass-card p-10 md:p-14 rounded-[4rem] shadow-premium border-white/20 bg-white/40 backdrop-blur-2xl">
          <div className="text-center mb-10 relative">
            <Link to="/forgot-password" className="absolute -top-10 left-0 text-mdOutline hover:text-mdPrimary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <FontAwesomeIcon icon={faArrowLeft} /> New Code
            </Link>
            
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-mdSecondary/10 text-mdSecondary mb-6 shadow-inner border border-mdSecondary/10">
              <FontAwesomeIcon icon={faKey} className="text-3xl" />
            </div>
            
            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter italic mb-4">
              Renew Identity
            </h1>
            <p className="text-mdOnSurfaceVariant font-medium text-sm leading-relaxed opacity-80 italic">
              "Witness the renewal of your digital key. Enter the sacred code sent to your scroll and set a new password."
            </p>
          </div>

          {message && (
            <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] px-6 py-4 rounded-3xl mb-10 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm animate-bounce">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl shrink-0" />
              {message}
            </div>
          )}

          {error && (
            <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-3xl mb-10 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-premium animate-shake border border-mdError/10">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl shrink-0" />
              {error}
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {location.state?.email && (
                <div className="bg-mdPrimary/5 border border-mdPrimary/10 text-mdOnSurface px-6 py-4 rounded-2xl mb-8 font-bold text-xs text-center italic opacity-60">
                  Renewing for: <span className="text-mdPrimary not-italic font-black">{location.state.email}</span>
                </div>
              )}

              <div className="group text-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-4 opacity-70">Enlightenment Code (6 Digits)</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-8 py-6 border border-mdOutline/10 rounded-[2rem] bg-white/50 focus:outline-none focus:ring-8 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all text-4xl font-black tracking-[0.5em] text-center text-mdPrimary placeholder:opacity-10"
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary">New Secret Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-6 py-5 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-mdOutline hover:text-mdPrimary transition-all"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary">Confirm Secret Key</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-6 py-5 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-mdOutline hover:text-mdPrimary transition-all"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mdPrimary text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-full shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all mt-6 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Renewing Identity...
                  </span>
                ) : 'Confirm Renewal'}
              </button>
            </form>
          ) : (
            <div className="text-center mt-12 animate-fade-in">
              <Link
                to="/login"
                className="w-full bg-mdSecondary text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-full shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                Return to Assembly
              </Link>
            </div>
          )}
          
          {!success && (
            <div className="text-center mt-12 pt-8 border-t border-mdOutline/5">
              <Link
                to="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-mdPrimary hover:text-mdSecondary underline underline-offset-4 decoration-2 transition-all"
              >
                Request New Revelation Code
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    );
}
