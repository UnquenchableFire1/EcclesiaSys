import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import Layout from '../layouts/Layout';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password, 'admin');
      if (response.data?.success) {
        const data = response.data;
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userName', data.name);
        navigate('/admin');
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
            Admin Login
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-6 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-600 font-semibold py-3 rounded-lg transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm mb-2">Are you a member?</p>
            <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
              Member Login
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
