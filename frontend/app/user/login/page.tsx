'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeProvider';
import { userLogin, verifyEmailOTP, resendVerification } from '../lib/api';
import { Suspense } from 'react';

// ─── Small reusable OTP panel ───────────────────────────────

function OtpPanel({ email, redirectUrl }: { email: string; redirectUrl: string }) {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [resendMsg, setResendMsg] = useState('');

    const handleChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const n = [...otp]; n[i] = val; setOtp(n);
        if (val && i < 5) (document.getElementById(`login-otp-${i + 1}`) as HTMLInputElement)?.focus();
    };
    const handleKey = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) (document.getElementById(`login-otp-${i - 1}`) as HTMLInputElement)?.focus();
    };
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const n = [...otp]; digits.split('').forEach((c, i) => { n[i] = c; }); setOtp(n);
        (document.getElementById(`login-otp-${Math.min(digits.length, 5)}`) as HTMLInputElement)?.focus();
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return setError('Please enter all 6 digits.');
        setError(''); setLoading(true);
        try {
            const res = await verifyEmailOTP(email, code);
            localStorage.setItem('user-data', JSON.stringify(res.data));
            window.dispatchEvent(new Event('ski-auth-change'));
            router.push(redirectUrl);
        } catch (err: any) { setError(err.message || 'Invalid code.'); }
        finally { setLoading(false); }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        setResendMsg(''); setError('');
        try {
            await resendVerification(email);
            setResendMsg('New code sent!'); setCooldown(60);
            const t = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'var(--accent-copper-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--accent-copper)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            </div>
            <div className="section-label">Email Verification Required</div>
            <h2 className="heading-serif" style={{ fontSize: '1.4rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Verify your email</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                We sent a code to <strong style={{ color: 'var(--text-heading)' }}>{email}</strong>
            </p>
            {error && <div style={{ marginBottom: '1rem', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.82rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>}
            {resendMsg && !error && <div style={{ marginBottom: '1rem', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.82rem', background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>{resendMsg}</div>}
            <form onSubmit={handleVerify}>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
                    {otp.map((d, i) => (
                        <input key={i} id={`login-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                            onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
                            style={{ width: 44, height: 52, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, border: `2px solid ${d ? 'var(--accent-copper)' : 'var(--border-color)'}`, borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--text-heading)', outline: 'none', transition: 'border-color 0.2s' }}
                        />
                    ))}
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', borderRadius: '6px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
            </form>
            <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                Didn&apos;t receive it?{' '}
                <button onClick={handleResend} disabled={cooldown > 0} style={{ background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', color: cooldown > 0 ? 'var(--text-muted)' : 'var(--accent-copper)', fontWeight: 600, fontSize: '0.82rem', padding: 0 }}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
            </p>
        </div>
    );
}

// ─── LOGIN FORM ───────────────────────────────────────────────

function UserLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/user/dashboard';

    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            return setError('Please enter both email and password');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return setError('Please enter a valid email address');
        }

        setLoading(true);
        try {
            const res = await userLogin(email, password);
            localStorage.setItem('user-data', JSON.stringify(res.data));
            window.dispatchEvent(new Event('ski-auth-change'));
            router.push(redirectUrl);
        } catch (err: any) {
            // Backend sends { unverified: true, email } when email not verified
            if (err.unverified) {
                setUnverifiedEmail(err.email || email);
            } else {
                setError(err.message);
            }
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {/* Left: Branding */}
            <div className="hidden lg:flex" style={{ width: '45%', background: 'var(--navy)', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20% 30%, var(--accent-copper) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="animate-fadeInUp" style={{ position: 'relative', textAlign: 'center', padding: '3rem', maxWidth: '420px' }}>
                    <svg width="64" height="64" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 2rem' }}>
                        <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                        <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.4" />
                        <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                    </svg>
                    <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--navy-text)', marginBottom: '0.75rem' }}>Welcome Back</h2>
                    <div className="copper-line copper-line-center" style={{ marginBottom: '1.5rem' }} />
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(245,240,235,0.55)', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Your trusted partner in premium real estate investment. Access your portfolio, track your team, and manage your earnings.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '2.5rem' }}>
                        {[{ n: '10K+', l: 'Investors' }, { n: '₹500Cr+', l: 'Business' }, { n: '98%', l: 'Satisfaction' }].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-copper)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>{s.n}</div>
                                <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,240,235,0.4)', fontFamily: 'var(--font-inter), sans-serif', marginTop: '0.25rem' }}>{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Form or OTP panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Top actions: Back & Theme */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        {unverifiedEmail ? (
                            <button onClick={() => setUnverifiedEmail(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Login
                            </button>
                        ) : (
                            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Home
                            </Link>
                        )}
                        <button onClick={toggleTheme} style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                    </div>

                    {/* Mobile logo */}
                    <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 0.75rem' }}>
                            <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                            <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                        </svg>
                    </div>

                    {unverifiedEmail ? (
                        /* OTP panel for unverified users trying to log in */
                        <OtpPanel email={unverifiedEmail} redirectUrl={redirectUrl} />
                    ) : (
                        /* Standard login form */
                        <>
                            <div className="section-label">Member Login</div>
                            <h1 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>Login</h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-inter), sans-serif' }}>Access your SKI investment account</p>

                            {error && (
                                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
                                </div>
                                <div style={{ marginBottom: '1.75rem' }}>
                                    <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', borderRadius: '6px', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                                Don&apos;t have an account?{' '}
                                <Link href={`/user/signup${redirectUrl !== '/user/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: 'var(--accent-copper)', fontWeight: 600 }}>Create Account</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserLoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserLoginForm />
        </Suspense>
    );
}
