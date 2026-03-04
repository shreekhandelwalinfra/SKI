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
            <div className="relative z-10 text-center w-full" style={{ padding: '120px 20px 60px' }}>
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                    {/* Badge */}
                    <div className="animate-fadeInUp" style={{ opacity: 0, animationDelay: '0.1s', marginBottom: '20px' }}>
                        <span style={{
                            display: 'inline-block', padding: '5px 16px', borderRadius: '50px',
                            background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.25)',
                            fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                            color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                        }}>
                            Premium Real Estate Investments
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="animate-fadeInUp" style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                        fontWeight: 700, color: '#F5F0EB',
                        lineHeight: 1.08, letterSpacing: '0.02em',
                        marginBottom: '16px',
                        opacity: 0, animationDelay: '0.25s',
                    }}>
                        Shree Khandelwal<br />
                        <span style={{ color: '#C4956A' }}>Infra</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="animate-fadeInUp" style={{
                        fontSize: 'clamp(0.82rem, 2.5vw, 1rem)', color: 'rgba(245,240,235,0.55)', lineHeight: 1.7,
                        fontFamily: 'var(--font-inter), sans-serif',
                        maxWidth: '440px', margin: '0 auto',
                        marginBottom: '28px',
                        opacity: 0, animationDelay: '0.4s',
                    }}>
                        Your trusted gateway to verified land investments across
                        Noida, Greater Noida, Jewar &amp; Mathura-Vrindavan.
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-fadeInUp" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '12px', flexWrap: 'wrap',
                        opacity: 0, animationDelay: '0.55s',
                    }}>
                        <Link href="/properties" style={{
                            display: 'inline-block', padding: '12px 28px', borderRadius: '50px',
                            background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                            color: '#fff', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', fontWeight: 700,
                            letterSpacing: '0.13em', textTransform: 'uppercase',
                            fontFamily: 'var(--font-inter), sans-serif', textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(196,149,106,0.3)',
                        }}>
                            View Properties
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
                            { val: '₹500Cr+', label: 'Volume' },
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
