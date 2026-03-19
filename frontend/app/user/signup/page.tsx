'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeProvider';
import { userSignup, verifyEmailOTP, resendVerification } from '../lib/api';

// ─── OTP VERIFICATION SCREEN ─────────────────────────────────

function OtpVerificationScreen({ email, onSuccess }: { email: string; onSuccess: (data: any) => void }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0); // seconds remaining before next resend
    const [resendMsg, setResendMsg] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Start a 60-second cooldown on mount (OTP was just sent)
    useEffect(() => {
        setCooldown(60);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; // only digits
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-advance to next box
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) return setError('Please enter all 6 digits.');
        setError('');
        setLoading(true);
        try {
            const res = await verifyEmailOTP(email, otpString);
            localStorage.setItem('user-data', JSON.stringify(res.data));
            window.dispatchEvent(new Event('ski-auth-change'));
            onSuccess(res.data);
        } catch (err: any) {
            setError(err.message || 'Invalid or expired code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resendLoading) return;
        setResendMsg('');
        setError('');
        setResendLoading(true);
        try {
            await resendVerification(email);
            setResendMsg('A new code has been sent to your email!');
            setCooldown(60);
        } catch (err: any) {
            setError(err.message || 'Failed to resend. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* Email icon */}
            <div style={{ width: 64, height: 64, background: 'var(--accent-copper-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--accent-copper)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            </div>

            <div className="section-label">Email Verification</div>
            <h1 className="heading-serif" style={{ fontSize: '1.6rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Check your inbox</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--text-heading)' }}>{email}</strong>.<br />
                It expires in 10 minutes.
            </p>

            {error && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>
            )}
            {resendMsg && !error && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>{resendMsg}</div>
            )}

            <form onSubmit={handleVerify}>
                {/* 6 individual OTP boxes */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.75rem' }} onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            style={{
                                width: 48, height: 56, textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
                                border: `2px solid ${digit ? 'var(--accent-copper)' : 'var(--border-color)'}`,
                                borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--text-heading)',
                                outline: 'none', transition: 'border-color 0.2s', caretColor: 'var(--accent-copper)',
                            }}
                        />
                    ))}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', borderRadius: '6px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>
            </form>

            {/* Resend section */}
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                Didn&apos;t receive the code?{' '}
                <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || resendLoading}
                    style={{ background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', color: cooldown > 0 ? 'var(--text-muted)' : 'var(--accent-copper)', fontWeight: 600, fontSize: '0.85rem', padding: 0 }}
                >
                    {resendLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
            </div>
        </div>
    );
}

// ─── SIGNUP FORM ─────────────────────────────────────────────

function UserSignupForm() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: refCode });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // After successful register, switch to OTP screen
    const [otpEmail, setOtpEmail] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) return setError('Full Name is required');
        if (form.name.trim().length < 3) return setError('Name must be at least 3 characters long');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) return setError('Please enter a valid email address');

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(form.phone.trim())) return setError('Please enter a valid 10-digit phone number');

        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            await userSignup({ name: form.name, email: form.email, phone: form.phone, password: form.password, referralCode: form.referralCode || undefined });
            // Switch to OTP screen — registration succeeded but no token yet
            setOtpEmail(form.email);
        } catch (err: any) {
            // If account exists but unverified, go straight to OTP screen
            if (err.unverified) {
                setOtpEmail(form.email);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSuccess = () => {
        router.push('/user/dashboard');
    };

    // ─── BRANDING PANEL ─────────────────────────────
    const brandingPanel = (
        <div className="hidden lg:flex" style={{ width: '40%', background: 'var(--navy)', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20% 30%, var(--accent-copper) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="animate-fadeInUp" style={{ position: 'relative', textAlign: 'center', padding: '3rem', maxWidth: '380px' }}>
                <img src="/logo.png" alt="SKI Logo" style={{ width: '96px', height: '96px', objectFit: 'contain', margin: '0 auto 2rem' }} />
                <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--navy-text)', marginBottom: '0.75rem' }}>
                    {otpEmail ? 'Almost There!' : 'Join SKI Family'}
                </h2>
                <div className="copper-line copper-line-center" style={{ marginBottom: '1.5rem' }} />
                <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(245,240,235,0.55)', fontFamily: 'var(--font-inter), sans-serif' }}>
                    {otpEmail
                        ? 'One last step. Verify your email to secure your account and access your investment dashboard.'
                        : 'Start your real estate investment journey. Build your team, earn commissions, and grow your wealth.'}
                </p>
                {!otpEmail && (
                    <div style={{ marginTop: '2.5rem', textAlign: 'left', maxWidth: '280px', marginLeft: 'auto', marginRight: 'auto' }}>
                        {['Free registration with instant activation', 'Earn from referrals and team growth', '10-rank reward system with premium gifts'].map((t, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'rgba(245,240,235,0.6)', fontFamily: 'var(--font-inter), sans-serif' }}>
                                <span style={{ color: 'var(--accent-copper)', marginTop: '1px' }}>✦</span> {t}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {brandingPanel}

            {/* Right: Form or OTP screen */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: otpEmail ? '400px' : '520px' }}>
                    {/* Top actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => otpEmail ? setOtpEmail(null) : router.back()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            {otpEmail ? 'Back to Sign Up' : 'Back to Home'}
                        </button>
                        <button onClick={toggleTheme} style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                    </div>

                    {otpEmail ? (
                        /* OTP Verification Screen */
                        <OtpVerificationScreen email={otpEmail} onSuccess={handleOtpSuccess} />
                    ) : (
                        /* Registration Form */
                        <>
                            <div className="section-label">Registration</div>
                            <h1 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>Create Account</h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontFamily: 'var(--font-inter), sans-serif' }}>Start your investment journey today</p>

                            {error && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>}
                            {refCode && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)', border: '1px solid rgba(181,132,90,0.15)' }}>Referred by: <strong>{refCode}</strong></div>}

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    {[
                                        { key: 'name', label: 'Full Name', type: 'text', span: 1 },
                                        { key: 'phone', label: 'Phone', type: 'tel', span: 1 },
                                        { key: 'email', label: 'Email Address', type: 'email', span: 2 },
                                        { key: 'password', label: 'Password', type: 'password', span: 1 },
                                        { key: 'confirmPassword', label: 'Confirm Password', type: 'password', span: 1 },
                                        { key: 'referralCode', label: 'Referral Code (Optional)', type: 'text', span: 2 },
                                    ].map(f => {
                                        const isPassword = f.key === 'password';
                                        const isConfirm = f.key === 'confirmPassword';
                                        const showText = isPassword ? showPassword : (isConfirm ? showConfirmPassword : false);
                                        const inputType = (isPassword || isConfirm) ? (showText ? 'text' : 'password') : f.type;

                                        return (
                                            <div key={f.key} style={{ gridColumn: f.span === 2 ? 'span 2' : undefined }}>
                                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{f.label}</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={inputType}
                                                        value={(form as any)[f.key]}
                                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                        className="input"
                                                        style={(isPassword || isConfirm) ? { paddingRight: '2.5rem' } : undefined}
                                                        required={f.key !== 'referralCode'}
                                                        readOnly={f.key === 'referralCode' && !!refCode}
                                                    />
                                                    {(isPassword || isConfirm) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => isPassword ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                                                            style={{
                                                                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                                                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem'
                                                            }}
                                                            title={showText ? "Hide password" : "Show password"}
                                                        >
                                                            {showText ? (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', borderRadius: '6px', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                                Already have an account? <Link href="/user/login" style={{ color: 'var(--accent-copper)', fontWeight: 600 }}>Sign In</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserSignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserSignupForm />
        </Suspense>
    );
}
