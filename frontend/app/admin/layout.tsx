'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../components/ThemeProvider';

const sidebarItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" /></svg>) },
    { href: '/admin/activation', label: 'Activation', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
    { href: '/admin/users', label: 'Users', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>) },
    { href: '/admin/investments', label: 'Investments', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
    { href: '/admin/profit', label: 'Profit', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>) },
    { href: '/admin/change-password', label: 'Password', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>) },
    { href: '/admin/support', label: 'Support', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>) },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (pathname !== '/admin/login') {
            const token = localStorage.getItem('admin-token');
            if (!token) router.push('/admin/login');
        }
    }, [pathname, router]);

    if (!mounted) return null;
    if (pathname === '/admin/login') return <>{children}</>;

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        router.push('/admin/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden animate-fadeIn" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />}

            <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ width: '270px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', transition: 'background 0.4s ease, border-color 0.4s ease', flexShrink: 0 }}>

                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                            <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="var(--accent-copper)" strokeWidth="1.5" />
                            <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.4" />
                            <text x="20" y="23" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="var(--accent-copper)" letterSpacing="1">SKI</text>
                        </svg>
                        <div>
                            <div className="heading-serif" style={{ fontSize: '0.9rem', color: 'var(--text-heading)', letterSpacing: '0.05em' }}>SKI Admin</div>
                            <div className="text-tracked" style={{ fontSize: '0.6rem', color: 'var(--accent-copper)' }}>Control Panel</div>
                        </div>
                    </Link>
                </div>

                <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
                    <div className="section-label" style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.6rem' }}>Navigation</div>
                    {sidebarItems.map(item => {
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

                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
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

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <header className="navbar-glass" style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden" style={{ padding: '0.5rem', border: 'none', cursor: 'pointer', background: 'var(--accent-copper-subtle)', borderRadius: '8px', color: 'var(--accent-copper)' }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="section-label" style={{ marginBottom: 0, fontSize: '0.65rem' }}>
                            {sidebarItems.find(i => i.href === pathname)?.label || 'Admin'}
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
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', color: 'var(--accent-copper)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '0.85rem' }}>A</div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1280px', width: '100%' }}>{children}</main>
            </div>
        </div>
    );
}
