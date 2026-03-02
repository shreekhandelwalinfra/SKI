'use client';

import Link from 'next/link';

export default function Portfolio() {
    return (
        <section className="section-padding">
            <div className="container-max">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left — Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        <img
                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop"
                            alt="Modern architectural interior"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Right — Content */}
                    <div>
                        <h2 className="section-title mb-6">
                            Our Portfolio
                        </h2>

                        <div className="copper-line mb-6" />

                        <p
                            className="text-sm leading-relaxed mb-8"
                            style={{ color: 'var(--text-muted)', maxWidth: '480px' }}
                        >
                            Lorem ipsum dolor sit amet, consectetur adipiscing, elit tvet. Tt tive
                            enonsing silnte tie as oole eezolet qnon let put obtont sizpos.
                            Discover our curated collection of premium properties and exclusive listings
                            that represent the finest in urban luxury and architectural excellence.
                        </p>

                        <Link
                            href="/properties"
                            className="btn-outline btn"
                        >
                            Explore More
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
