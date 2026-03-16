import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import Layout from '../layouts/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash, faPlus, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        actualEmail: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertDialog, setAlertDialog] = useState(null);
    const navigate = useNavigate();

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
                const generatedEmail = response.data.email;
                // save credentials
                localStorage.setItem('memberEmail', generatedEmail);
                // auto-login as member
                if (response.data.userId) {
                    localStorage.setItem('userId', response.data.userId);
                    localStorage.setItem('userType', 'member');
                    localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
                    localStorage.setItem('sessionId', Date.now().toString()); // Add unique session ID
                    localStorage.setItem('isNewMember', 'true');
                }
                setAlertDialog({
                    title: 'Welcome!',
                    message: `WELCOME TO ECCLESIASYS CHURCH MANAGEMENT SYSTEM. YOUR LOGIN EMAIL IS "${generatedEmail}" USE THIS ANYTIME LOGGING IN`,
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
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    <a href="/" className="absolute left-0 top-1/2 -translate-y-1/2 text-mdOutline hover:text-mdPrimary transition-colors flex items-center gap-1 text-sm font-bold">
                        <FontAwesomeIcon icon={faArrowLeft} /> Home
                    </a>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mdPrimaryContainer text-mdPrimary mb-4 shadow-sm mx-auto">
                        <FontAwesomeIcon icon={faPlus} className="text-3xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-mdPrimary tracking-tight mb-2">Join EcclesiaSys</h1>
                    <p className="text-mdOnSurfaceVariant font-medium">Create your member account</p>
                </div>

                {/* Card */}
                <div className="bg-mdSurface text-mdOnSurface rounded-3xl shadow-md2 p-8 md:p-10 border border-mdSurfaceVariant">
                    {error && (
                        <div className="mb-6 p-4 bg-mdErrorContainer text-mdError rounded-2xl text-center font-bold text-sm animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">First Name</label>
                                <input 
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Last Name</label>
                                <input 
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Phone Number</label>
                            <input 
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                placeholder="(123) 456-7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Personal Email</label>
                            <input 
                                type="email"
                                name="actualEmail"
                                value={formData.actualEmail}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                placeholder="your.email@example.com"
                            />
                            <p className="text-xs text-mdOutline mt-2 ml-1">This email will be used to send you password reset links</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    placeholder="Min. 8 chars, A-Z, a-z, 0-9, symbol"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-mdOutline hover:text-mdPrimary transition-colors duration-200"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Confirm Password</label>
                            <div className="relative">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-4 text-mdOutline hover:text-mdPrimary transition-colors duration-200"
                                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-mdPrimaryContainer/30 p-4 rounded-2xl border border-mdPrimaryContainer mt-4">
                            <p className="text-mdOnSurfaceVariant text-xs font-medium leading-relaxed">
                                An email will be automatically generated for you after registration. Please save it for logging in.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-mdPrimary text-mdOnPrimary font-bold py-4 rounded-full hover:bg-mdSecondary hover:shadow-md2 transition-all duration-300 shadow-md1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-mdSurfaceVariant text-center">
                        <p className="text-mdOnSurfaceVariant text-sm font-medium">
                            Already have an account? <a href="/login" className="text-mdPrimary font-extrabold hover:text-mdSecondary transition-colors duration-200">Login here</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Dialog */}
            {alertDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-mdSurface rounded-3xl shadow-md3 p-8 max-w-sm w-full mx-auto animate-fade-in text-center relative">
                        <div className={`mx-auto flex items-center justify-center p-4 rounded-full mb-4 w-16 h-16 bg-mdPrimaryContainer text-mdPrimary`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-mdOnSurface mb-2">{alertDialog.title}</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 text-base">{alertDialog.message}</p>
                        <button
                            onClick={() => {
                                setAlertDialog(null);
                                if (alertDialog.onConfirm) alertDialog.onConfirm();
                            }}
                            className="w-full bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold py-3 rounded-full transition-colors duration-200"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

