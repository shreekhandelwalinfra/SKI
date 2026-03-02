'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../components/ThemeProvider';
import { adminLogin } from '../lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('admin@ski.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await adminLogin(email, password);
            if (res.data?.role !== 'admin') { setError('Access denied. Admin only.'); setLoading(false); return; }
            localStorage.setItem('admin-token', res.data.token);
            localStorage.setItem('admin-user', JSON.stringify(res.data));
            router.push('/admin/dashboard');
        } catch (err: any) { setError(err.message || 'Login failed'); } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {/* Left: Admin Branding */}
            <div className="hidden lg:flex" style={{ width: '45%', background: 'var(--navy)', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* Hex grid pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23C4956A\' stroke-width=\'0.5\'%3E%3Cpath d=\'M30 5L55 17.5V42.5L30 55L5 42.5V17.5L30 5Z\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
                <div className="animate-fadeInUp" style={{ position: 'relative', textAlign: 'center', padding: '3rem', maxWidth: '420px' }}>
                    <svg width="80" height="80" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 2rem' }}>
                        <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                        <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.3" />
                        <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                    </svg>
                    <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--navy-text)', marginBottom: '0.5rem' }}>Admin Panel</h2>
                    <div className="text-tracked" style={{ fontSize: '0.65rem', color: 'var(--accent-copper)', marginBottom: '1.5rem' }}>Shree Khandelwal Infra</div>
                    <div className="copper-line copper-line-center" style={{ marginBottom: '1.5rem' }} />
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(245,240,235,0.5)', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Manage users, investments, profits, and the complete real estate platform from a single powerful dashboard.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
                        <div style={{ width: '40px', height: '1px', background: 'rgba(196,149,106,0.2)' }} />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-copper)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <div style={{ width: '40px', height: '1px', background: 'rgba(196,149,106,0.2)' }} />
                    </div>
                    <div className="text-tracked" style={{ fontSize: '0.55rem', color: 'rgba(245,240,235,0.25)', marginTop: '1rem' }}>Authorized Access Only</div>
                </div>
            </div>

            {/* Right: Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                        <button onClick={toggleTheme} style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 0.75rem' }}>
                            <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                            <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                        </svg>
                    </div>

                    <div className="section-label">Administration</div>
                    <h1 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>Admin Login</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-inter), sans-serif' }}>Access the control panel</p>

                    {error && <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
                        </div>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label className="text-tracked" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
                        </div>
                        <button type="submit" disabled={loading} className="btn" style={{ width: '100%', borderRadius: '6px', background: loading ? 'var(--text-muted)' : 'var(--navy)', color: '#fff', border: '1px solid var(--navy)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Signing in...' : 'Access Panel'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
