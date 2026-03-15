
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import Layout from '../layouts/Layout';

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
        localStorage.setItem('sessionId', Date.now().toString()); // Add unique session ID
        if (data.userType === 'admin') {
          navigate('/admin');
        } else if (data.userType === 'member') {
          navigate('/member-dashboard');
        }
      } else {
        setError('Account does not exist');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Account does not exist');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in py-12">
      <div className="bg-mdSurface text-mdOnSurface p-10 rounded-3xl shadow-md2 w-full max-w-md border border-mdSurfaceVariant">
        <div className="text-center mb-8 relative">
          <a href="/" className="absolute left-0 top-1/2 -translate-y-1/2 text-mdOutline hover:text-mdPrimary transition-colors flex items-center gap-1 text-sm font-bold">
            <span>←</span> Home
          </a>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mdPrimaryContainer text-mdPrimary mb-4 shadow-sm mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">
            Welcome Back
          </h2>
          <p className="text-mdOnSurfaceVariant mt-2">Login to view your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-mdOutline hover:text-mdPrimary transition-colors duration-200"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {error && (
            <div className="bg-mdErrorContainer text-mdError px-4 py-3 rounded-2xl text-center text-sm font-semibold animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold py-4 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
          >
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-mdSurfaceVariant text-center space-y-3">
          <p className="text-mdOnSurfaceVariant text-sm">
            <a href="/forgot-password" className="text-mdPrimary font-bold hover:text-mdSecondary transition-colors duration-200">
              Forgot Password?
            </a>
          </p>
          <p className="text-mdOnSurfaceVariant text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-mdPrimary font-bold hover:text-mdSecondary transition-colors duration-200">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
