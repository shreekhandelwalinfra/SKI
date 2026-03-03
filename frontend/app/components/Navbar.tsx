'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-2 ml-4">
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
                    className="lg:hidden fixed inset-0 top-0 z-40 animate-fadeIn"
                    style={{ background: 'var(--bg-primary)' }}
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

                        {/* Mobile Auth Buttons */}
                        <div className="flex flex-col items-center gap-4 mt-4 pt-6" style={{ borderTop: '1px solid rgba(196,149,106,0.15)' }}>
                        </div>
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
                    </div>
                </div>
            )}
        </header>
    );
}
