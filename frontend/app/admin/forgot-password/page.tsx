'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeProvider';
import { requestPasswordReset, resetPasswordWithOTP } from '../lib/api';

function AdminForgotPasswordForm() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim()) return setError('Please enter your email address');

        setLoading(true);
        try {
            const res = await requestPasswordReset(email.trim());
            setMessage(res.message || 'If an account exists, a reset code has been sent.');
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!otp.trim() || otp.trim().length !== 6) return setError('Please enter a valid 6-digit code');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters');
        if (newPassword !== confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            const res = await resetPasswordWithOTP(email.trim(), otp.trim(), newPassword);
            setMessage(res.message || 'Password successfully reset!');
            setTimeout(() => {
                router.push('/admin/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const eyeIcon = (showState: boolean, toggleAction: () => void) => (
        <button
            type="button"
            onClick={toggleAction}
            style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem'
            }}
            title={showState ? "Hide password" : "Show password"}
        >
            {showState ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
        </button>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {/* Left: Admin Branding */}
            <div className="hidden lg:flex" style={{ width: '45%', background: 'var(--navy)', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* Hex grid pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23C4956A\' stroke-width=\'0.5\'%3E%3Cpath d=\'M30 5L55 17.5V42.5L30 55L5 42.5V17.5L30 5Z\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
                <div className="animate-fadeInUp" style={{ position: 'relative', textAlign: 'center', padding: '3rem', maxWidth: '420px' }}>
                    <img src="/logo.png" alt="SKI Logo" className="brand-logo" style={{ width: '120px', height: '120px', objectFit: 'contain', margin: '0 auto 2rem' }} />
                    <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--navy-text)', marginBottom: '0.5rem' }}>Admin Recovery</h2>
                    <div className="text-tracked" style={{ fontSize: '0.65rem', color: 'var(--accent-copper)', marginBottom: '1.5rem' }}>Shree Khandelwal Infra</div>
                    <div className="copper-line copper-line-center" style={{ marginBottom: '1.5rem' }} />
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(245,240,235,0.5)', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Securely verify your identity to regain administrative access to the investment platform.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
                        <div style={{ width: '40px', height: '1px', background: 'rgba(196,149,106,0.2)' }} />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-copper)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <div style={{ width: '40px', height: '1px', background: 'rgba(196,149,106,0.2)' }} />
                    </div>
                </div>
            </div>

            {/* Right: Reset Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <button onClick={() => step === 2 ? setStep(1) : router.push('/admin/login')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            {step === 2 ? 'Back' : 'Back to Admin Login'}
                        </button>
                        <button onClick={toggleTheme} style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="section-label">Identity Verification</div>
                    <h1 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                        {step === 1 ? 'Recover Dashboard Access' : 'Create New Password'}
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2.5rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                        {step === 1 ? "Enter your administrator email address to request a secure OTP reset code." : "Enter the 6-digit code sent to your email and select a strong new password."}
                    </p>

                    {error && (
                        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>
                    )}
                    {message && (
                        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }}>{message}</div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Administrator Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required autoFocus />
                            </div>
                            <button type="submit" disabled={loading} className="btn" style={{ width: '100%', borderRadius: '6px', background: 'var(--accent-copper)', color: '#fff', border: 'none', padding: '0.85rem', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Transmitting Code...' : 'Request Secure Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>6-Digit Authorization Code</label>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="input" placeholder="000000" maxLength={6} required autoFocus style={{ letterSpacing: '8px', fontSize: '1.2rem', textAlign: 'center' }} />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Administrative Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="input"
                                        style={{ paddingRight: '2.5rem' }}
                                        required
                                    />
                                    {eyeIcon(showPassword, () => setShowPassword(!showPassword))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Confirm Passphrase</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="input"
                                        style={{ paddingRight: '2.5rem' }}
                                        required
                                    />
                                    {eyeIcon(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
                                </div>
                            </div>
                            <button type="submit" disabled={loading || message.includes('successfully')} className="btn" style={{ width: '100%', borderRadius: '6px', background: 'var(--accent-copper)', color: '#fff', border: 'none', padding: '0.85rem', fontWeight: 600, opacity: (loading || message.includes('successfully')) ? 0.7 : 1 }}>
                                {loading ? 'Applying Policies...' : 'Confirm Reset && Login'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminForgotPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminForgotPasswordForm />
        </Suspense>
    );
}
