'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

const navLinks = [
    { href: '/properties?category=residential-land', label: 'Residences' },
    { href: '/properties?category=commercial-land', label: 'Estates' },
    { href: '/properties', label: 'Urban Luxury' },
    { href: '/earning-plan', label: 'Earning Plan' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

// Geometric SKI Logo SVG matching the reference diamond/hexagonal style
function SKILogo() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer hexagonal shape */}
            <path
                d="M20 2L35 10V30L20 38L5 30V10L20 2Z"
                stroke="var(--accent-copper)"
                strokeWidth="1.5"
                fill="none"
            />
            {/* Inner geometric diamond */}
            <path
                d="M20 8L30 14V26L20 32L10 26V14L20 8Z"
                stroke="var(--accent-copper)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
            />
            {/* SKI letters */}
            <text
                x="20"
                y="23"
                textAnchor="middle"
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize="10"
                fontWeight="700"
                fill="var(--accent-copper)"
                letterSpacing="1"
            >
                SKI
            </text>
        </svg>
    );
}

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check auth state on mount and when storage changes
    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('user-token');
                const data = localStorage.getItem('user-data');
                if (token && data) {
                    const parsed = JSON.parse(data);
                    setUser({ name: parsed.name || 'User' });
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
        };

        checkAuth();

        // Listen for storage changes (login/logout from another tab)
        window.addEventListener('storage', checkAuth);
        // Custom event for same-tab login/logout
        window.addEventListener('ski-auth-change', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('ski-auth-change', checkAuth);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user-token');
        localStorage.removeItem('user-data');
        setUser(null);
        setDropdownOpen(false);
        setMobileOpen(false);
        router.push('/');
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'navbar-glass shadow-md' : 'bg-transparent'
                }`}
        >
            <nav className="container-max flex items-center justify-between px-6 py-5">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <SKILogo />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="nav-link"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Auth Area */}
                    <div className="flex items-center gap-2 ml-4">
                        {user ? (
                            /* ── Logged-in state ── */
                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '6px 14px 6px 6px', borderRadius: '50px', cursor: 'pointer',
                                        background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.15)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {/* Avatar circle */}
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', fontWeight: 800, color: '#fff',
                                        fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.05em',
                                    }}>
                                        {getInitials(user.name)}
                                    </div>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 600, color: '#F5F0EB',
                                        fontFamily: 'var(--font-inter), sans-serif',
                                        maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {user.name.split(' ')[0]}
                                    </span>
                                    {/* Chevron */}
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                        <path d="M2 4L5 7L8 4" stroke="rgba(245,240,235,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {dropdownOpen && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                        minWidth: '180px', borderRadius: '12px',
                                        background: 'rgba(21,21,35,0.95)', backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(196,149,106,0.12)',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                        padding: '6px', overflow: 'hidden',
                                        animation: 'fadeIn 0.15s ease-out',
                                    }}>
                                        <Link
                                            href="/user/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', borderRadius: '8px', textDecoration: 'none',
                                                fontSize: '0.78rem', fontWeight: 500, color: '#F5F0EB',
                                                fontFamily: 'var(--font-inter), sans-serif',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,149,106,0.08)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/user/investments"
                                            onClick={() => setDropdownOpen(false)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', borderRadius: '8px', textDecoration: 'none',
                                                fontSize: '0.78rem', fontWeight: 500, color: '#F5F0EB',
                                                fontFamily: 'var(--font-inter), sans-serif',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,149,106,0.08)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                            Investments
                                        </Link>
                                        <Link
                                            href="/user/profit"
                                            onClick={() => setDropdownOpen(false)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', borderRadius: '8px', textDecoration: 'none',
                                                fontSize: '0.78rem', fontWeight: 500, color: '#F5F0EB',
                                                fontFamily: 'var(--font-inter), sans-serif',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,149,106,0.08)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                            My Earnings
                                        </Link>
                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                                padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                                                background: 'transparent', border: 'none',
                                                fontSize: '0.78rem', fontWeight: 500, color: '#ef4444',
                                                fontFamily: 'var(--font-inter), sans-serif',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Guest state ── */
                            <>
                                <Link
                                    href="/user/login"
                                    className="nav-link px-3 py-1.5 transition-all"
                                    style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(245,240,235,0.55)' }}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/user/signup"
                                    className="px-5 py-2 transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                                        color: '#fff', fontSize: '0.65rem', letterSpacing: '0.12em',
                                        textTransform: 'uppercase', fontWeight: 700, borderRadius: '50px',
                                        boxShadow: '0 2px 12px rgba(196,149,106,0.25)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex lg:hidden items-center gap-3">
                    <button onClick={toggleTheme} className="p-2" style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
                        {theme === 'dark' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 top-0 z-[60] animate-fadeIn"
                    style={{ background: '#0a0a12' }}
                >
                    <div className="flex justify-end p-6">
                        <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-8 pt-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="nav-link text-base"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Auth */}
                        <div className="flex flex-col items-center gap-4 mt-4 pt-6" style={{ borderTop: '1px solid rgba(196,149,106,0.15)' }}>
                        </div>

                        {user ? (
                            /* ── Logged-in mobile ── */
                            <>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px',
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 800, color: '#fff',
                                        fontFamily: 'var(--font-inter), sans-serif',
                                    }}>
                                        {getInitials(user.name)}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5F0EB' }}>
                                        {user.name}
                                    </span>
                                </div>
                                <Link
                                    href="/user/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="px-8 py-3 transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                                        color: '#fff', fontSize: '0.7rem', letterSpacing: '0.12em',
                                        textTransform: 'uppercase', fontWeight: 700, borderRadius: '50px',
                                        boxShadow: '0 2px 12px rgba(196,149,106,0.25)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                                        fontWeight: 600, color: 'rgba(239,68,68,0.7)', textDecoration: 'none',
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            /* ── Guest mobile ── */
                            <>
                                <Link
                                    href="/user/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="transition-all"
                                    style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(245,240,235,0.5)', textDecoration: 'none' }}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/user/signup"
                                    onClick={() => setMobileOpen(false)}
                                    className="px-8 py-3 transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                                        color: '#fff', fontSize: '0.7rem', letterSpacing: '0.12em',
                                        textTransform: 'uppercase', fontWeight: 700, borderRadius: '50px',
                                        boxShadow: '0 2px 12px rgba(196,149,106,0.25)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
