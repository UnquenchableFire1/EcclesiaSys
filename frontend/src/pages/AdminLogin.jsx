import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import Layout from '../layouts/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password);
      if (response.data?.success) {
        const data = response.data;
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('userType', data.userType);
        sessionStorage.setItem('userName', data.name);
        navigate('/admin');
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="bg-mdSurface text-mdOnSurface p-10 rounded-3xl shadow-md2 w-full max-w-md border border-mdSurfaceVariant">
        <div className="text-center mb-8 relative">
          <a href="/login" className="absolute left-0 top-1/2 -translate-y-1/2 text-mdOutline hover:text-mdSecondary transition-colors flex items-center gap-1 text-sm font-bold">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back
          </a>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mdSecondaryContainer text-mdSecondary mb-4 shadow-sm mx-auto">
            <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-mdSecondary tracking-tight">
            Admin Portal
          </h2>
          <p className="text-mdOnSurfaceVariant mt-2">Secure access for administrators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdSecondary focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdSecondary focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {error && (
            <div className="bg-mdErrorContainer text-mdError px-4 py-3 rounded-2xl text-center text-sm font-semibold animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-mdSecondary hover:bg-mdPrimary text-mdOnSecondary font-bold py-4 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-mdSurfaceVariant text-center">
          <a href="/login" className="text-mdSecondary font-bold hover:text-mdPrimary transition-colors duration-200">
            Back to Member Login
          </a>
        </div>
      </div>
    </div>
  );
}
