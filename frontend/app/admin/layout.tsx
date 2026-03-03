'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../components/ThemeProvider';

const sidebarItems = [
    {
        href: '/admin/dashboard', label: 'Dashboard',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
    },
    {
        href: '/admin/activation', label: 'Activation',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
        href: '/admin/users', label: 'Users',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    },
    {
        href: '/admin/investments', label: 'Investments',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
    },
    {
        href: '/admin/profit', label: 'Profit',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
        href: '/admin/support', label: 'Support',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
    },
    {
        href: '/admin/change-password', label: 'Password',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
    },
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

    const currentLabel = sidebarItems.find(i => i.href === pathname)?.label || 'Admin';

    return (
        <div data-theme="dark" style={{ display: 'flex', minHeight: '100vh', background: 'var(--admin-bg)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden animate-fadeIn"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{
                    width: '260px', flexShrink: 0,
                    background: 'var(--admin-sidebar-bg, linear-gradient(180deg, #0D0D18 0%, #111120 60%, #0A0A14 100%))',
                    borderRight: '1px solid var(--admin-border)',
                }}
            >
                {/* Brand */}
                <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--admin-border)' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(196,149,106,0.2), rgba(27,42,74,0.4))',
                            border: '1px solid rgba(196,149,106,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                                <path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" stroke="#C4956A" strokeWidth="1.5" />
                                <text x="20" y="23" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fontWeight="700" fill="#C4956A" letterSpacing="1">SKI</text>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F5F0EB', letterSpacing: '0.05em', fontFamily: 'var(--font-playfair), Georgia, serif' }}>SKI Admin</div>
                            <div style={{ fontSize: '0.6rem', color: '#C4956A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif' }}>Control Panel</div>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#636380', padding: '0 0.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                        Navigation
                    </div>
                    {sidebarItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.65rem 0.75rem', borderRadius: '10px', marginBottom: '2px',
                                    background: isActive ? 'rgba(196,149,106,0.1)' : 'transparent',
                                    color: isActive ? '#C4956A' : '#7A7A8A',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.82rem',
                                    fontWeight: isActive ? 600 : 400,
                                    transition: 'all 0.2s ease',
                                    borderLeft: isActive ? '2px solid #C4956A' : '2px solid transparent',
                                    boxShadow: isActive ? '0 0 20px rgba(196,149,106,0.08)' : 'none',
                                }}
                            >
                                <span style={{ opacity: isActive ? 1 : 0.4, transition: 'opacity 0.2s' }}>{item.icon}</span>
                                {item.label}
                                {isActive && (
                                    <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#C4956A', boxShadow: '0 0 6px #C4956A' }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer actions */}
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--admin-border)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px',
                            border: 'none', cursor: 'pointer',
                            background: 'rgba(244, 63, 94, 0.06)', color: '#f43f5e',
                            fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.82rem',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Top header */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 30,
                    background: 'var(--admin-header-bg, rgba(7,7,16,0.85))', backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid var(--admin-border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden"
                                style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', background: 'rgba(196,149,106,0.1)', borderRadius: '8px', color: '#C4956A' }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                            </button>
                            {/* Breadcrumb */}
                            <div>
                                <span style={{ fontSize: '0.6rem', color: '#7A7A8A', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif' }}>Admin /</span>
                                {' '}
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5F0EB', fontFamily: 'var(--font-inter), sans-serif' }}>{currentLabel}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Avatar */}
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #C4956A, #D4A574)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontFamily: 'var(--font-playfair), serif', fontWeight: 700, fontSize: '0.85rem',
                                boxShadow: '0 0 12px rgba(196,149,106,0.35)',
                            }}>A</div>
                        </div>
                    </div>
                    {/* Gradient accent line */}
                    <div className="admin-header-line" />
                </header>

                <main className="admin-main" style={{ flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
