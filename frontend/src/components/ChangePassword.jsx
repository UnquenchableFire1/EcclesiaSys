import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faLock, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { changePassword } from '../services/api';

export default function ChangePassword({ userType, userId }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await changePassword(userType, userId, formData.currentPassword, formData.newPassword);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: response.data.message || 'Failed to update password' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Server error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in py-12 px-4">
      <div className="bg-white dark:bg-mdSurface rounded-[3rem] shadow-premium border border-mdOutline/10 overflow-hidden">
        <div className="bg-mdSecondary p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
            <FontAwesomeIcon icon={faKey} />
          </div>
          <h2 className="text-3xl font-black text-white">Change Password</h2>
          <p className="text-white/80 font-medium">Keep your account secure</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {status.message && (
            <div className={`p-4 rounded-2xl flex items-center gap-4 animate-bounce ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <FontAwesomeIcon icon={status.type === 'success' ? faCheckCircle : faExclamationTriangle} />
              <span className="font-bold">{status.message}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-mdOnSurfaceVariant mb-2 ml-1">Current Password</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-6 py-4 bg-mdSurfaceVariant/30 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mdSecondary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-mdOnSurfaceVariant mb-2 ml-1">New Password</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-6 py-4 bg-mdSurfaceVariant/30 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mdSecondary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-mdOnSurfaceVariant mb-2 ml-1">Confirm New Password</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-6 py-4 bg-mdSurfaceVariant/30 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mdSecondary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full font-black text-lg shadow-md1 hover:shadow-md2 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 ${loading ? 'bg-mdOutline/20 text-mdOutline' : 'bg-mdSecondary text-white'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FontAwesomeIcon icon={faKey} />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
