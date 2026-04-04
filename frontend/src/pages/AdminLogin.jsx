import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import AssemblyLogo from '../components/AssemblyLogo';
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
        sessionStorage.setItem('token', data.token); // Legacy support
        sessionStorage.setItem('authToken', data.token); // JWT for Authorization header
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('userType', data.userType);
        sessionStorage.setItem('userName', data.name);
        sessionStorage.setItem('branchId', data.branchId); // Save branch context for admin
        sessionStorage.setItem('role', data.role); // Save role for superadmin checks
        navigate('/admin');
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fade-in overflow-hidden bg-mdSurface">
      {/* Left Side: Structural Assembly */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden group">
        <img 
          src="/assets/images/church/church_1.jpg" 
          alt="Admin Foundation" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
        />
        <div className="image-overlay-dark opacity-70"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full p-20 text-white text-center">
        <div className="mb-12">
            <AssemblyLogo size={120} showText={false} isDark={true} className="animate-float" />
        </div>
        <h2 className="text-6xl font-black tracking-tighter mb-6 leading-tight italic">
          Assembly<br/>Oversight.
        </h2>
        <p className="text-xl font-medium max-w-sm opacity-80 leading-relaxed italic">
          "Stewarding the sacred flame of our community with wisdom and integrity."
        </p>
    </div>
  </div>

  {/* Right Side: Admin Authentication */}
  <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20 relative">
    {/* Mobile Background Image */}
    <div className="md:hidden absolute inset-0 z-0">
        <img src="/assets/images/church/church_1.jpg" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-mdSurface/80"></div>
    </div>

    <div className="relative z-10 w-full max-w-md">
      <div className="mb-12 relative flex flex-col items-center">
        <a href="/login" className="absolute -top-12 left-0 text-mdOutline hover:text-mdSecondary transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <FontAwesomeIcon icon={faArrowLeft} /> Member Portal
        </a>
        
        <div className="text-center mb-10">
            <AssemblyLogo size={64} showText={true} />
        </div>

            <h2 className="text-3xl font-black text-mdOnSurface tracking-tight text-center">
              Gateway Access
            </h2>
            <p className="text-mdOnSurfaceVariant mt-2 font-medium opacity-60 text-center italic">Verify your credentials to oversee the assembly</p>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdSecondary transition-colors">Admin Scroll (Email)</label>
                <input
                    type="email"
                    placeholder="admin@assembly.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-5 border border-mdOutline/10 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-mdSecondary/5 focus:border-mdSecondary transition-all font-bold"
                    required
                />
            </div>
  
            <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdSecondary transition-colors">Key of Command (Password)</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-5 border border-mdOutline/10 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-mdSecondary/5 focus:border-mdSecondary transition-all font-bold"
                    required
                />
            </div>
  
            {error && (
              <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border border-mdError/10 animate-shake">
                {error}
              </div>
            )}
  
            <button
              type="submit"
              className="w-full bg-mdSecondary text-mdOnSecondary font-black text-xs uppercase tracking-[0.3em] py-6 rounded-full shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all mt-4 active:scale-95"
            >
              Authorize Access
            </button>
          </form>
  
          <div className="mt-12 pt-8 border-t border-mdOutline/5 text-center">
            <a href="/login" className="text-xs font-black uppercase tracking-widest text-mdSecondary hover:text-mdPrimary underline underline-offset-4 decoration-2 transition-all">
                Back to Member Fellowship
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
