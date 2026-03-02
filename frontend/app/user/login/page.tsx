'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeProvider';
import { userLogin } from '../lib/api';

export default function UserLoginPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('rahul@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await userLogin(email, password);
            localStorage.setItem('user-token', res.data.token);
            localStorage.setItem('user-data', JSON.stringify(res.data));
            router.push('/user/dashboard');
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {/* Left: Branding */}
            <div className="hidden lg:flex" style={{ width: '45%', background: 'var(--navy)', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* Pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20% 30%, var(--accent-copper) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                {/* Content */}
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

            {/* Right: Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Theme toggle */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
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

                    <div className="section-label">Member Login</div>
                    <h1 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>Sign In</h1>
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
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/user/signup" style={{ color: 'var(--accent-copper)', fontWeight: 600 }}>Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
