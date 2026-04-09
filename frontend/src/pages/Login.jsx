import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { login } from '../services/api';
import AssemblyLogo from '../components/AssemblyLogo';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from 
    ? location.state.from.pathname + (location.state.from.search || "") 
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.data?.success) {
        const data = response.data;
        sessionStorage.setItem('token', data.token); // Legacy support
        sessionStorage.setItem('authToken', data.token); // JWT for Authorization header
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('userType', data.userType);
        sessionStorage.setItem('userName', data.name);
        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('branchId', data.branchId); // Save branch context
        sessionStorage.setItem('role', data.role); // Save role for superadmin checks
        sessionStorage.setItem('sessionId', Date.now().toString()); // Add unique session ID
        
        let destination = from && from !== '/' ? from : null;

        if (data.userType === 'admin') {
          navigate(destination || '/admin', { replace: true });
        } else if (data.userType === 'member') {
          navigate(destination || '/member-dashboard', { replace: true });
        }
      } else {
        if (response.data?.requireVerification) {
            navigate('/verify-email', { state: { email: response.data.email } });
        } else {
            setError(response.data?.message || 'Account does not exist');
        }
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Account does not exist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fade-in overflow-hidden">
      {/* Left Side: Visual Assembly */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden group bg-gradient-to-br from-mdPrimary to-mdTertiary">
        <div className="absolute inset-0 bg-black/40 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full p-20 text-white text-center">
            <div className="mb-12">
                <AssemblyLogo size={120} showText={false} isDark={true} className="animate-float" />
            </div>
            <h2 className="text-6xl font-black tracking-tighter mb-6 leading-tight">
              A Home for Every Soul.
            </h2>
            <p className="text-xl font-medium max-w-md opacity-80 leading-relaxed italic">
              "For where two or three gather in my name, there am I with them."
            </p>
            <div className="mt-12 flex gap-4">
               <span className="w-12 h-1 bg-mdSecondary rounded-full"></span>
               <span className="w-4 h-1 bg-white/30 rounded-full"></span>
               <span className="w-4 h-1 bg-white/30 rounded-full"></span>
            </div>
        </div>
      </div>

      {/* Right Side: Authentication */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20 bg-mdSurface relative">
        {/* Mobile Background Image (Low opacity) */}
        <div className="md:hidden absolute inset-0 z-0 bg-mdPrimary/5">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-12 relative flex flex-col items-center">
            <a href="/" className="self-start md:absolute md:-top-12 md:left-0 mb-8 md:mb-0 text-mdOutline hover:text-mdPrimary transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest w-full justify-center md:justify-start">
              <FontAwesomeIcon icon={faArrowLeft} /> Return Home
            </a>
            
            <div className="text-center mb-10 w-full flex justify-center mt-4 md:mt-0">
                <AssemblyLogo size={64} showText={true} />
            </div>

            <h2 className="text-3xl font-black text-mdOnSurface tracking-tight">
              Welcome Back
            </h2>
            <p className="text-mdOnSurfaceVariant mt-2 font-medium opacity-60">Enter the assembly of your digital dashboard</p>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Digital Identity</label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-5 border border-mdOutline/10 rounded-[1.5rem] bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all duration-300 font-bold"
                required
              />
            </div>
  
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Secret Word</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-5 border border-mdOutline/10 rounded-[1.5rem] bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all duration-300 font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-5 text-mdOutline hover:text-mdPrimary transition-all duration-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-lg" />
                </button>
              </div>
            </div>
  
            {error && (
              <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border border-mdError/10 animate-shake">
                {error}
              </div>
            )}
  
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-mdPrimary text-mdOnPrimary font-black text-xs uppercase tracking-[0.2em] py-6 rounded-full shadow-premium hover:shadow-lifted transition-all duration-500 transform hover:-translate-y-1 mt-4 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authorizing...
                </span>
              ) : 'Enter Assembly'}
            </button>
          </form>
  
          <div className="mt-12 pt-8 border-t border-mdOutline/5 text-center space-y-4">
            <p>
              <a href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-mdPrimary hover:text-mdSecondary transition-colors">
                Forgotten Wisdom? (Reset Password)
              </a>
            </p>
            <p className="text-xs font-bold text-mdOnSurfaceVariant">
              New to our fellowship?{' '}
              <a href="/register" className="text-mdPrimary font-black hover:text-mdSecondary underline underline-offset-4 decoration-2 transition-all">
                Join our Community
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
