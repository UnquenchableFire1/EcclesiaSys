import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyRegistrationOtp, sendOtp } from '../services/api';
import SanctuaryLogo from '../components/SanctuaryLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpenText, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || sessionStorage.getItem('memberEmail');

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const res = await verifyRegistrationOtp(email, otp);
            if (res.data?.success) {
                setSuccess('Email verified successfully!');
                setTimeout(() => {
                    navigate('/login', { state: { message: 'Verification successful. Please log in.' } });
                }, 2000);
            } else {
                setError(res.data?.message || 'Verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError('');
        setSuccess('');
        try {
            const res = await sendOtp(email);
            if (res.data?.success) {
                setSuccess('A new verification code has been sent to your email.');
            } else {
                setError(res.data?.message || 'Failed to resend code.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code. Please try again later.');
        } finally {
            setIsResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-mdSurface relative overflow-hidden animate-fade-in">
            {/* Background Map/Image Details */}
            <div className="absolute inset-0 z-0">
                <img src="/assets/images/church/church_5.jpg" alt="" className="w-full h-full object-cover opacity-15" />
                <div className="absolute inset-0 bg-gradient-to-b from-mdSurface/50 via-mdSurface/80 to-mdSurface"></div>
            </div>

            <div className="glass-card relative z-10 w-full max-w-md p-10 md:p-14 border border-white/20 shadow-premium rounded-[3rem] text-center">
                <div className="mb-8 flex justify-center">
                    <SanctuaryLogo size={80} showText={false} />
                </div>

                <div className="w-20 h-20 mx-auto bg-mdPrimary/10 text-mdPrimary rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner">
                    <FontAwesomeIcon icon={faEnvelopeOpenText} />
                </div>

                <h2 className="text-3xl font-black text-mdOnSurface tracking-tight mb-3">Verify Your Email</h2>
                <p className="text-mdOnSurfaceVariant font-medium text-sm leading-relaxed mb-10">
                    We've sent a 6-digit verification code to <br />
                    <span className="font-bold text-mdOnSurface bg-mdSurfaceVariant/50 px-3 py-1 rounded-full">{email}</span>
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-mdErrorContainer text-mdError rounded-2xl text-xs font-black uppercase tracking-widest border border-mdError/10 animate-shake">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 text-green-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-green-500/10 animate-fade-in">
                        {success}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6 text-left">
                    <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2 ml-1 group-focus-within:text-mdPrimary transition-colors">Verification Code</label>
                        <input 
                            type="text" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-6 py-4 bg-white/50 border border-mdOutline/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-mdPrimary/5 focus:border-mdPrimary transition-all font-bold text-center tracking-[0.5em] text-2xl"
                            placeholder="000000"
                            maxLength="6"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || otp.length < 6}
                        className="w-full bg-mdPrimary text-mdOnPrimary font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl shadow-premium hover:shadow-lifted hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg" />
                        ) : (
                            <>
                                Verify Identity <FontAwesomeIcon icon={faArrowRight} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-mdOutline/10">
                    <p className="text-sm font-medium text-mdOnSurfaceVariant">
                        Didn't receive the code?{' '}
                        <button 
                            type="button" 
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-mdPrimary font-black hover:text-mdSecondary transition-colors disabled:opacity-50"
                        >
                            {isResending ? 'Sending...' : 'Resend Code'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
