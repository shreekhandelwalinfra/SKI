'use client';

import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
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
                    style={{ background: 'linear-gradient(180deg, rgba(10,10,18,0.7) 0%, rgba(10,10,18,0.4) 40%, rgba(10,10,18,0.6) 70%, rgba(10,10,18,0.92) 100%)' }}
                />
            </div>

            {/* Decorative copper line */}
            <div
                className="absolute top-0 left-[15%] right-[15%] h-[1px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(196,149,106,0.5), transparent)' }}
            />

            {/* Content — centered */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ paddingTop: '80px' }}>
                {/* Badge */}
                <div
                    className="animate-fadeInUp"
                    style={{ opacity: 0, animationDelay: '0.1s' }}
                >
                    <span
                        style={{
                            display: 'inline-block', padding: '6px 20px', borderRadius: '50px',
                            background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.25)',
                            fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                            color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                            marginBottom: '28px',
                        }}
                    >
                        Premium Real Estate Investments
                    </span>
                </div>

                {/* Main Heading */}
                <h1
                    className="animate-fadeInUp"
                    style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 700, color: '#F5F0EB',
                        lineHeight: 1.08, letterSpacing: '0.02em',
                        marginBottom: '20px',
                        opacity: 0, animationDelay: '0.25s',
                    }}
                >
                    Shree Khandelwal<br />
                    <span style={{ color: '#C4956A' }}>Infra</span>
                </h1>

                {/* Subtitle */}
                <p
                    className="animate-fadeInUp"
                    style={{
                        fontSize: '1rem', color: 'rgba(245,240,235,0.55)', lineHeight: 1.8,
                        fontFamily: 'var(--font-inter), sans-serif',
                        maxWidth: '480px', margin: '0 auto 36px',
                        opacity: 0, animationDelay: '0.4s',
                    }}
                >
                    Your trusted gateway to verified land investments across
                    Noida, Greater Noida, Jewar &amp; Mathura-Vrindavan.
                </p>

                {/* CTA Buttons */}
                <div
                    className="animate-fadeInUp flex items-center justify-center gap-4 flex-wrap"
                    style={{ opacity: 0, animationDelay: '0.55s' }}
                >
                    <Link
                        href="/properties"
                        style={{
                            display: 'inline-block', padding: '14px 36px', borderRadius: '50px',
                            background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                            color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            fontFamily: 'var(--font-inter), sans-serif',
                            textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(196,149,106,0.3)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                    >
                        View Properties
                    </Link>
                    <Link
                        href="/earning-plan"
                        style={{
                            display: 'inline-block', padding: '14px 36px', borderRadius: '50px',
                            background: 'transparent', border: '1px solid rgba(245,240,235,0.15)',
                            color: 'rgba(245,240,235,0.7)', fontSize: '0.75rem', fontWeight: 600,
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            fontFamily: 'var(--font-inter), sans-serif',
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}
                    >
                        Earning Plan
                    </Link>
                </div>

                {/* Stats bar */}
                <div
                    className="animate-fadeInUp"
                    style={{
                        marginTop: '56px', display: 'flex', justifyContent: 'center', gap: '48px',
                        opacity: 0, animationDelay: '0.7s', flexWrap: 'wrap',
                    }}
                >
                    {[
                        { val: '500+', label: 'Properties Delivered' },
                        { val: '15+', label: 'Years Experience' },
                        { val: '₹500Cr+', label: 'Business Volume' },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C4956A', fontFamily: 'var(--font-playfair)', marginBottom: '4px' }}>{s.val}</div>
                            <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,235,0.35)', fontFamily: 'var(--font-inter)' }}>{s.label}</div>
                        </div>
                    ))}
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
