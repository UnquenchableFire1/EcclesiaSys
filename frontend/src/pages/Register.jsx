import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getBranches } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash, faPlus, faUserPlus, faChurch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import SanctuaryLogo from '../components/SanctuaryLogo';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        branchId: ''
    });
    const [branches, setBranches] = useState([]);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertDialog, setAlertDialog] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranchesList = async () => {
            try {
                const response = await getBranches();
                if (response.data && response.data.success) {
                    setBranches(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch branches", err);
            }
        };
        fetchBranchesList();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Prevent double submission
        if (isSubmitting) {
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Password strength validation
        const password = formData.password;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSymbols) {
            setError('Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols');
            return;
        }

        try {
            setIsSubmitting(true);
            // send the form data
            const response = await register(formData);
            if (response.data?.success) {
                // save credentials
                sessionStorage.setItem('memberEmail', formData.email);
                // auto-login as member
                if (response.data.userId) {
                    sessionStorage.setItem('userId', response.data.userId);
                    sessionStorage.setItem('userType', 'member');
                    sessionStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
                    sessionStorage.setItem('branchId', formData.branchId); // Persist branch context
                    sessionStorage.setItem('sessionId', Date.now().toString());
                    sessionStorage.setItem('isNewMember', 'true');
                }
                setAlertDialog({
                    title: 'Welcome!',
                    message: `Registration successful! You can now log in using your email: ${formData.email}`,
                    onConfirm: () => navigate('/member-dashboard')
                });
            } else {
                setError(response.data?.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error', err);
            const msg = err.response?.data?.message || err.message || 'Network error';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row animate-fade-in overflow-hidden">
            {/* Left Side: Visual Sanctuary */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden group">
                <img 
                    src="/assets/images/church/church_5.jpg" 
                    alt="Sanctuary Fellowship" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                />
                <div className="image-overlay-dark opacity-60"></div>
                <div className="relative z-10 flex flex-col justify-center items-center h-full p-20 text-white text-center">
                    <div className="mb-12">
                        <SanctuaryLogo size={120} showText={false} isDark={true} className="animate-float" />
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter mb-6 leading-tight">
                        Join our Sacred Fellowship.
                    </h2>
                    <p className="text-xl font-medium max-w-md opacity-80 leading-relaxed italic">
                        "Welcome to the sanctuary of believers, where every soul finds a home and a purpose."
                    </p>
                    <div className="mt-12 flex gap-4">
                        <span className="w-4 h-1 bg-white/30 rounded-full"></span>
                        <span className="w-12 h-1 bg-mdSecondary rounded-full"></span>
                        <span className="w-4 h-1 bg-white/30 rounded-full"></span>
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-mdSurface relative overflow-y-auto custom-scrollbar">
                {/* Mobile Background Image (Low opacity) */}
                <div className="md:hidden absolute inset-0 z-0 h-full">
                    <img src="/assets/images/church/church_5.jpg" alt="" className="w-full h-full object-cover opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
                </div>

                <div className="relative z-10 w-full max-w-xl py-12">
                    <div className="mb-10 relative flex flex-col items-center">
                        <a href="/" className="absolute -top-12 left-0 text-mdOutline hover:text-mdPrimary transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                            <FontAwesomeIcon icon={faArrowLeft} /> Return Home
                        </a>
                        
                        <div className="text-center mb-10">
                            <SanctuaryLogo size={64} showText={true} />
                        </div>

                        <h2 className="text-3xl font-black text-mdOnSurface tracking-tight">
                            Create Member Identity
                        </h2>
                        <p className="text-mdOnSurfaceVariant mt-2 font-medium opacity-60 italic">Begin your journey in our digital sanctuary</p>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white shadow-premium">
                        {error && (
                            <div className="mb-8 p-5 bg-mdErrorContainer text-mdError rounded-2xl text-center text-xs font-black uppercase tracking-widest border border-mdError/10 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Given Name</label>
                                    <input 
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Family Name</label>
                                    <input 
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Contact Signal</label>
                                    <input 
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                                        placeholder="(123) 456-7890"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Digital Scroll (Email)</label>
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Secret Key</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-4 text-mdOutline hover:text-mdPrimary transition-all"
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Confirm Key</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-4 text-mdOutline hover:text-mdPrimary transition-all"
                                        >
                                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Sanctuary Location (Branch)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-mdPrimary">
                                        <FontAwesomeIcon icon={faChurch} />
                                    </span>
                                    <select 
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-14 pr-10 py-5 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all appearance-none font-bold"
                                    >
                                        <option value="">Choose your branch</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-mdOutline">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-mdPrimary text-mdOnPrimary font-black text-xs uppercase tracking-[0.3em] py-6 rounded-full shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all mt-8 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enrolling...
                                    </span>
                                ) : 'Begin Fellowship'}
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-mdOutline/5 text-center">
                            <p className="text-xs font-bold text-mdOnSurfaceVariant">
                                Already part of the fellowship? <a href="/login" className="text-mdPrimary font-black hover:text-mdSecondary underline underline-offset-4 decoration-2 transition-all">Enter Sanctuary</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Dialog */}
            {alertDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[3000] flex items-center justify-center p-4">
                    <div className="glass-card relative z-10 w-full max-w-sm bg-white p-10 border-none rounded-[3rem] animate-slide-up text-center">
                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-600 mb-6 shadow-inner">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-3xl font-black text-mdOnSurface mb-4 tracking-tighter italic">{alertDialog.title}</h3>
                        <p className="text-mdOnSurfaceVariant mb-10 text-base font-medium leading-relaxed">{alertDialog.message}</p>
                        <button
                            onClick={() => {
                                setAlertDialog(null);
                                if (alertDialog.onConfirm) alertDialog.onConfirm();
                            }}
                            className="w-full bg-mdPrimary text-white font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-2xl shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all"
                        >
                            Enter Sanctuary
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

