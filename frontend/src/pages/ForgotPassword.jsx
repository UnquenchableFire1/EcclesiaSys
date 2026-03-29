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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden animate-fade-in">
      {/* Classy CSS background — animated brand-colour orbs, no images */}
      <div className="sanctuary-bg"></div>
      <div className="sanctuary-grid"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-10 md:p-12 rounded-[3.5rem] shadow-premium border-white/20 bg-white/40 backdrop-blur-2xl">
          <div className="text-center mb-10 relative">
            <Link to="/login" className="absolute -top-6 left-0 text-mdOutline hover:text-mdPrimary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
            </Link>
            
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-mdPrimary/10 text-mdPrimary mb-6 shadow-inner border border-mdPrimary/10">
              <FontAwesomeIcon icon={faKey} className="text-3xl" />
            </div>
            
            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter italic mb-4">
              Restore Access
            </h1>
            <p className="text-mdOnSurfaceVariant font-medium text-sm leading-relaxed opacity-80 italic">
              "Seeking the path back to the sanctuary? Enter your digital scroll (email) to receive a renewal code."
            </p>
          </div>

          {message && (
            <div className="bg-mdPrimary/10 border border-mdPrimary/20 text-mdPrimary px-6 py-4 rounded-2xl mb-8 text-xs font-black uppercase tracking-widest text-center animate-bounce">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-2xl mb-8 text-xs font-black uppercase tracking-widest text-center animate-shake border border-mdError/10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">
                Registered Digital Scroll
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-mdPrimary/50">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sanctuary.org"
                  className="w-full pl-14 pr-6 py-5 bg-white/50 border border-mdOutline/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold placeholder:opacity-30"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mdPrimary text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-full shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all mt-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Dispatching Code...
                </span>
              ) : 'Send Renewal Code'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-mdOutline/5 text-center">
            <p className="text-xs font-bold text-mdOnSurfaceVariant italic transform hover:scale-105 transition-transform">
              Remembered your Key?{' '}
              <Link to="/login" className="text-mdPrimary font-black underline underline-offset-4 decoration-2">
                Return to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    );
}
