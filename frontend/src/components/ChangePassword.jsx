import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faLock, faCheckCircle, faExclamationTriangle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { changePassword } from '../services/api';

export default function ChangePassword({ userType, userId }) {
  const [formData, setFormData] = useState({
    enteredEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Passwords
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const userEmail = sessionStorage.getItem('userEmail');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (formData.enteredEmail.trim().toLowerCase() !== userEmail?.trim().toLowerCase()) {
      setStatus({ type: 'error', message: 'Verification failed. Please ensure you are using the email linked to your account.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await response.json();
      if (data.success) {
        setStep(2);
        setStatus({ type: 'success', message: 'Verification code sent to your email!' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to send verification code' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to verification service' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/verification/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: otp })
      });
      const data = await response.json();
      
      if (data.success) {
        setStep(3);
        setStatus({ type: 'success', message: 'Email verified. Please enter your new password.' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Invalid verification code' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to verification service' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    
    if (formData.newPassword === formData.currentPassword) {
      setStatus({ type: 'error', message: 'New password cannot be same as old password' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword(userType, userId, formData.currentPassword, formData.newPassword, otp);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setFormData({ enteredEmail: '', currentPassword: '', newPassword: '', confirmPassword: '' });
        setOtp('');
        setStep(1);
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

        <div className="px-10 pt-8">
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-mdOutline/20 -z-10 -translate-y-1/2 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-mdSecondary -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-mdSecondary text-white' : 'bg-mdSurfaceVariant text-mdOnSurfaceVariant'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-mdSecondary text-white' : 'bg-mdSurfaceVariant text-mdOnSurfaceVariant'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-mdSecondary text-white' : 'bg-mdSurfaceVariant text-mdOnSurfaceVariant'}`}>3</div>
          </div>
        </div>

        <form onSubmit={step === 1 ? handleCheckEmail : step === 2 ? handleVerifyOtp : handleSubmitPassword} className="px-10 pb-10 space-y-6">
          {status.message && (
            <div className={`p-4 rounded-2xl flex items-center gap-4 animate-bounce ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <FontAwesomeIcon icon={status.type === 'success' ? faCheckCircle : faExclamationTriangle} />
              <span className="font-bold">{status.message}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-mdSecondary/10 p-4 rounded-2xl mb-4 text-center">
                <p className="text-sm text-mdSecondary font-bold">Please verify your email address to continue.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-mdOnSurfaceVariant mb-2 ml-1">Enter your email</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                  <input
                    type="email"
                    name="enteredEmail"
                    value={formData.enteredEmail}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-6 py-4 bg-mdSurfaceVariant/30 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mdSecondary transition-all"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-mdSecondary/10 p-4 rounded-2xl mb-4 text-center">
                <p className="text-sm text-mdSecondary font-bold">
                  Please enter the 6-digit code sent to<br/>
                  <span className="text-mdOnSurface">{userEmail}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-mdOnSurfaceVariant mb-2 ml-1">Verification Code</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCheckCircle} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full pl-12 pr-6 py-4 bg-mdSurfaceVariant/30 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mdSecondary transition-all text-center text-2xl tracking-[0.5em] font-black"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm font-bold text-mdSecondary hover:underline w-full text-center"
              >
                ← Use a different email
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
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
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full font-black text-lg shadow-md1 hover:shadow-md2 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 ${loading ? 'bg-mdOutline/20 text-mdOutline' : 'bg-mdSecondary text-white'}`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                {step === 1 ? 'Sending...' : step === 2 ? 'Verifying...' : 'Updating...'}
              </>
            ) : (
              <>
                {step === 1 && <><FontAwesomeIcon icon={faEnvelope} /> Send Verification Code</>}
                {step === 2 && <><FontAwesomeIcon icon={faCheckCircle} /> Verify Code</>}
                {step === 3 && <><FontAwesomeIcon icon={faKey} /> Update Password</>}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
