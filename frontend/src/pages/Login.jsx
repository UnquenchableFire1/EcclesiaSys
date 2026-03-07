
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import Layout from '../layouts/Layout';

export default function Login() {
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
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userName', data.name);
        if (data.userType === 'admin') {
          navigate('/admin');
        } else if (data.userType === 'member') {
          navigate('/member-dashboard');
        }
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error', err);
      const msg = err.response?.data?.message || err.message || 'Network error';
      setError(msg);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-tealDeep mb-6 text-center">
            Login to view your dashboard
          </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-primary font-semibold py-3 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm mb-3">
            <a href="/forgot-password" className="text-tealDeep font-semibold hover:text-lemon transition">
              Forgot Password?
            </a>
          </p>
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-tealDeep font-semibold hover:text-lemon transition">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
    </Layout>
  );
}
