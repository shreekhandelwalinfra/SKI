'use client';

import Link from 'next/link';

const reasons = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Trusted & Verified',
        description: 'All our properties are legally verified with clear titles and RERA/MVDA approvals.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Pan-India Presence',
        description: 'Operating across Noida, Greater Noida, Jewar, Delhi NCR, Mathura & Vrindavan.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        title: 'High ROI Potential',
        description: 'Strategic locations near upcoming infrastructure projects promising exceptional returns.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: 'Expert Guidance',
        description: '15+ years of industry expertise with dedicated relationship managers for every client.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        title: 'Complete Documentation',
        description: 'End-to-end documentation support including registry, mutation, and legal assistance.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Transparent Pricing',
        description: 'No hidden charges. What you see is what you pay. Competitive rates guaranteed.',
    },
];

export default function WhyChooseSKI() {
    return (
        <section className="section-padding">
            <div className="container-max">
                {/* Header */}
                <div className="text-center mb-14">
                    <span className="section-label">Why Choose Us</span>
                    <h2 className="section-title">The SKI Advantage</h2>
                    <div className="copper-line copper-line-center" />
                    <p className="section-subtitle mx-auto mt-4">
                        With over 15 years of excellence, we bring unmatched expertise and trust to your real estate journey.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reasons.map((reason, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-lg transition-all duration-300 hover:shadow-lg"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        >
                            <div
                                className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-colors"
                                style={{
                                    background: 'var(--accent-copper-subtle)',
                                    color: 'var(--accent-copper)',
                                }}
                            >
                                {reason.icon}
                            </div>
                            <h3
                                className="text-lg font-bold mb-3"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                {reason.title}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
