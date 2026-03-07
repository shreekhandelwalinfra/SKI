'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';
import { SocketProvider, useSocket } from '../../lib/SocketContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const navItems = [
    { href: '/user/dashboard', label: 'Dashboard', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>) },
    { href: '/user/team', label: 'My Team', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
    { href: '/user/investments', label: 'Investments', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
    { href: '/user/support', label: 'Support', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>) },
    { href: '/user/profit', label: 'Profit', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>) },
    { href: '/user/profile', label: 'Profile', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>) },
];

export default function UserLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState('');
    const [userUniqueId, setUserUniqueId] = useState('');
    const [userStatus, setUserStatus] = useState('');

    // Fetch fresh user data from API
    const refreshUserData = useCallback(async () => {
        try {
            const token = localStorage.getItem('user-token');
            if (!token) return;
            const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const json = await res.json();
            const u = json.data;
            if (u) {
                setUserName(u.name || '');
                setUserUniqueId(u.uniqueId || '');
                setUserStatus(u.status || '');
                // Sync localStorage too
                const stored = localStorage.getItem('user-data');
                if (stored) {
                    const old = JSON.parse(stored);
                    localStorage.setItem('user-data', JSON.stringify({ ...old, name: u.name, uniqueId: u.uniqueId, status: u.status }));
                }
            }
        } catch { }
    }, []);

    useEffect(() => {
        setMounted(true);
        // Quick load from localStorage first
        try {
            const stored = localStorage.getItem('user-data');
            if (stored) {
                const u = JSON.parse(stored);
                setUserName(u.name || '');
                setUserUniqueId(u.uniqueId || '');
                setUserStatus(u.status || '');
            }
        } catch { }
        if (pathname !== '/user/login' && pathname !== '/user/signup') {
            const token = localStorage.getItem('user-token');
            if (!token) router.push('/user/login');
            else refreshUserData(); // Then sync with real API data
        }
    }, [pathname, router, refreshUserData]);

    // No longer connecting local socket, just importing the logic conceptually for later refactor on individual pages, or grabbing global hook if needed.
    // However, the Layout itself doesn't need to listen to socket events natively here yet, we will just wrap the provider.

    if (!mounted) return null;
    if (pathname === '/user/login' || pathname === '/user/signup') return <>{children}</>;

    const handleLogout = () => {
        localStorage.removeItem('user-token');
        localStorage.removeItem('user-data');
        router.push('/user/login');
    };

    const isPending = userStatus.toUpperCase() === 'PENDING';

    return (
        <SocketProvider>
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
                {/* Mobile overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden animate-fadeIn" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside
                    className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                    style={{ width: '270px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', transition: 'background 0.4s ease, border-color 0.4s ease', flexShrink: 0 }}>

                    {/* Brand */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                                <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                                <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.4" />
                                <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                            </svg>
                            <div>
                                <div className="heading-serif" style={{ fontSize: '0.9rem', color: 'var(--text-heading)', letterSpacing: '0.05em' }}>Shree Khandelwal</div>
                                <div className="text-tracked" style={{ fontSize: '0.6rem', color: 'var(--accent-copper)' }}>My Account</div>
                            </div>
                        </Link>

                        {/* Back to Home Breadcrumb */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <Link href="/"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.75rem', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Website
                            </Link>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
                        <div className="section-label" style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.6rem' }}>Navigation</div>
                        {navItems.map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.7rem 0.75rem', borderRadius: '8px', marginBottom: '2px',
                                        background: isActive ? 'var(--accent-copper-subtle)' : 'transparent',
                                        color: isActive ? 'var(--accent-copper)' : 'var(--text-secondary)',
                                        fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.82rem',
                                        fontWeight: isActive ? 600 : 400, letterSpacing: '0.03em',
                                        transition: 'all 0.2s ease', textDecoration: 'none',
                                        borderLeft: isActive ? '3px solid var(--accent-copper)' : '3px solid transparent',
                                    }}>
                                    <span style={{ opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info + Footer */}
                    <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        {/* User Identity */}
                        {userName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', marginBottom: '0.5rem', borderRadius: '8px', background: 'var(--accent-copper-subtle)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-copper)', color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{userName.charAt(0).toUpperCase()}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-inter), sans-serif' }}>{userName}</div>
                                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--accent-copper)' }}>{userUniqueId}</div>
                                </div>
                                {isPending && <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.05em', marginLeft: 'auto', flexShrink: 0 }}>PENDING</span>}
                                {!isPending && userStatus && <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 600, letterSpacing: '0.05em', marginLeft: 'auto', flexShrink: 0 }}>ACTIVE</span>}
                            </div>
                        )}
                        {/* Theme Toggle */}
                        <button onClick={toggleTheme}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.7rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.82rem', transition: 'all 0.2s ease', marginBottom: '4px' }}>
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        <button onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.7rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#ef4444', fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.82rem', transition: 'all 0.2s ease' }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Area */}
                <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <header className="navbar-glass" style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden" style={{ padding: '0.5rem', border: 'none', cursor: 'pointer', background: 'var(--accent-copper-subtle)', borderRadius: '8px', color: 'var(--accent-copper)' }}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <div>
                                <div className="section-label" style={{ marginBottom: 0, fontSize: '0.65rem' }}>
                                    {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button onClick={toggleTheme} style={{ padding: '0.5rem', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', borderRadius: '50%', transition: 'color 0.2s' }}>
                                {theme === 'dark' ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                )}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {userName && <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-inter), sans-serif' }}>{userName}</span>}
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-copper)', color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '0.85rem' }}>{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                            </div>
                        </div>
                    </header>

                    <div className="user-main" style={{ flex: 1, maxWidth: '1280px', width: '100%' }}>
                        {children}
                    </div>
                </main>
            </div>
        </SocketProvider>
    );
}
