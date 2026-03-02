'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeProvider';
import { userSignup } from '../lib/api';

export default function UserSignupPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: refCode });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const res = await userSignup({ name: form.name, email: form.email, phone: form.phone, password: form.password, referralCode: form.referralCode || undefined });
            localStorage.setItem('user-token', res.data.token);
            localStorage.setItem('user-data', JSON.stringify(res.data));
            router.push('/user/dashboard');
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {/* Left: Branding */}
            <div className="hidden lg:flex" style={{ width: '40%', background: 'var(--navy)', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20% 30%, var(--accent-copper) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="animate-fadeInUp" style={{ position: 'relative', textAlign: 'center', padding: '3rem', maxWidth: '380px' }}>
                    <svg width="64" height="64" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 2rem' }}>
                        <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                        <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.4" />
                        <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                    </svg>
                    <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--navy-text)', marginBottom: '0.75rem' }}>Join SKI Family</h2>
                    <div className="copper-line copper-line-center" style={{ marginBottom: '1.5rem' }} />
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(245,240,235,0.55)', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Start your real estate investment journey. Build your team, earn commissions, and grow your wealth.
                    </p>
                    <div style={{ marginTop: '2.5rem', textAlign: 'left', maxWidth: '280px', marginLeft: 'auto', marginRight: 'auto' }}>
                        {['Free registration with instant activation', 'Earn from referrals and team growth', '10-rank reward system with premium gifts'].map((t, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'rgba(245,240,235,0.6)', fontFamily: 'var(--font-inter), sans-serif' }}>
                                <span style={{ color: 'var(--accent-copper)', marginTop: '1px' }}>✦</span> {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '520px' }}>
                    {/* Top actions: Back & Theme */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Home
                        </Link>
                        <button onClick={toggleTheme} style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                    </div>

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
                            ].map(f => (
                                <div key={f.key} style={{ gridColumn: f.span === 2 ? 'span 2' : undefined }}>
                                    <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{f.label}</label>
                                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="input" required={f.key !== 'referralCode'} readOnly={f.key === 'referralCode' && !!refCode} />
                                </div>
                            ))}
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', borderRadius: '6px', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Already have an account? <Link href="/user/login" style={{ color: 'var(--accent-copper)', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
