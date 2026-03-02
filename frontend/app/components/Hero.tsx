'use client';

import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative h-[85vh] min-h-[600px] flex items-end overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80&auto=format&fit=crop"
                    alt="Luxury modern villa exterior"
                    className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'var(--hero-overlay)' }}
                />
            </div>

            {/* Copper line at top of hero */}
            <div
                className="absolute top-0 left-[10%] right-[10%] h-[1px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent-copper), transparent)', opacity: 0.5 }}
            />

            {/* Content */}
            <div className="relative z-10 container-max px-6 pb-16 md:pb-20 w-full">
                <div className="max-w-2xl">
                    {/* Main Heading */}
                    <h1
                        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fadeInUp"
                        style={{
                            fontFamily: 'var(--font-playfair)',
                            color: '#F5F0EB',
                            lineHeight: 1.05,
                            letterSpacing: '0.03em',
                            opacity: 0,
                            animationDelay: '0.2s',
                        }}
                    >
                        Shree Khandelwal
                        <br />
                        Infra
                    </h1>

                    {/* Subtitle */}
                    <p
                        className="text-xs md:text-sm tracking-[0.25em] uppercase mb-8 animate-fadeInUp"
                        style={{
                            color: 'rgba(245, 240, 235, 0.75)',
                            fontFamily: 'var(--font-inter)',
                            opacity: 0,
                            animationDelay: '0.4s',
                        }}
                    >
                        Exclusive Urban Estates
                    </p>

                    {/* CTA Button */}
                    <div className="animate-fadeInUp" style={{ opacity: 0, animationDelay: '0.6s' }}>
                        <Link
                            href="/properties"
                            className="inline-flex items-center gap-2 px-8 py-3 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:text-white"
                            style={{
                                color: 'var(--accent-copper)',
                                border: '1px solid var(--accent-copper)',
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            View Listings
                        </Link>
                    </div>
                </div>
            </div>

            {/* Copper line at bottom of hero */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[1px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent-copper), transparent)', opacity: 0.4 }}
            />
        </section>
    );
}
