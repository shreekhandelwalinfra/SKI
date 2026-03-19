'use client';

import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh' }}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80&auto=format&fit=crop"
                    alt="Luxury modern villa exterior"
                    className="w-full h-full object-cover"
                    style={{ transform: 'scale(1.05)' }}
                />
                {/* Dark gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(10,10,18,0.75) 0%, rgba(10,10,18,0.45) 40%, rgba(10,10,18,0.6) 70%, rgba(10,10,18,0.92) 100%)' }}
                />
            </div>

            {/* Decorative copper line */}
            <div
                className="absolute top-0 left-[15%] right-[15%] h-[1px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(196,149,106,0.5), transparent)' }}
            />

            {/* Content — centered */}
            <div className="relative z-10 text-center w-full flex flex-col items-center justify-center" style={{ padding: '120px 20px 60px' }}>
                <div style={{
                    maxWidth: '800px', margin: '0 auto',
                    background: 'radial-gradient(ellipse at center, rgba(10,10,18,0.5) 0%, rgba(10,10,18,0) 70%)',
                    padding: '40px 20px',
                    borderRadius: '50px'
                }}>
                    {/* Badge */}
                    <div className="animate-fadeInUp" style={{ opacity: 0, animationDelay: '0.1s', marginBottom: '24px' }}>
                        <span style={{
                            display: 'inline-block', padding: '6px 20px', borderRadius: '50px',
                            background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.3)',
                            fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                            color: '#e0b88a', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                            Premium Real Estate Investments
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="animate-fadeInUp" style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        fontWeight: 700, color: '#F5F0EB',
                        lineHeight: 1.1, letterSpacing: '0.01em',
                        marginBottom: '20px',
                        opacity: 0, animationDelay: '0.25s',
                        textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                    }}>
                        Shree Khandelwal<br />
                        <span style={{ color: '#C4956A', fontStyle: 'normal', textShadow: '0 4px 15px rgba(196,149,106,0.2)' }}>Infra</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="animate-fadeInUp" style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: 'rgba(245,240,235,0.9)', lineHeight: 1.8,
                        fontFamily: 'var(--font-inter), sans-serif',
                        maxWidth: '540px', margin: '0 auto',
                        marginBottom: '36px',
                        opacity: 0, animationDelay: '0.4s',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                        fontWeight: 500,
                    }}>
                        Your trusted gateway to verified land investments across
                        Noida, Greater Noida, Jewar & Mathura-Vrindavan.
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-fadeInUp" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '12px', flexWrap: 'wrap',
                        opacity: 0, animationDelay: '0.55s',
                    }}>
                        <Link href="/user/signup" style={{
                            display: 'inline-block', padding: '12px 28px', borderRadius: '50px',
                            background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                            color: '#fff', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', fontWeight: 700,
                            letterSpacing: '0.13em', textTransform: 'uppercase',
                            fontFamily: 'var(--font-inter), sans-serif', textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(196,149,106,0.3)',
                        }}>
                            Get Started
                        </Link>
                        <Link href="/earning-plan" style={{
                            display: 'inline-block', padding: '12px 28px', borderRadius: '50px',
                            background: 'transparent', border: '1px solid rgba(245,240,235,0.15)',
                            color: 'rgba(245,240,235,0.7)', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', fontWeight: 600,
                            letterSpacing: '0.13em', textTransform: 'uppercase',
                            fontFamily: 'var(--font-inter), sans-serif', textDecoration: 'none',
                        }}>
                            Earning Plan
                        </Link>
                    </div>

                    {/* Stats bar */}
                    <div className="animate-fadeInUp" style={{
                        marginTop: '40px', display: 'flex', justifyContent: 'center',
                        gap: 'clamp(20px, 5vw, 48px)', flexWrap: 'wrap',
                        opacity: 0, animationDelay: '0.7s',
                    }}>
                        {[
                            { val: '500+', label: 'Properties' },
                            { val: '15+', label: 'Years' },
                            { val: '₹500Cr+', label: 'Team Business' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', minWidth: '70px' }}>
                                <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#C4956A', fontFamily: 'var(--font-playfair)', marginBottom: '2px' }}>{s.val}</div>
                                <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,240,235,0.3)', fontFamily: 'var(--font-inter)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div
                className="absolute bottom-0 left-0 right-0 h-24 z-10"
                style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
            />
        </section>
    );
}
