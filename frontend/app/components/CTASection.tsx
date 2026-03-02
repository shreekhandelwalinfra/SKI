import Link from 'next/link';

export default function CTASection() {
    return (
        <section
            className="relative py-20 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #0F0F14 100%)',
            }}
        >
            {/* Decorative */}
            <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, var(--accent-copper) 0%, transparent 70%)' }}
            />

            <div className="container-max px-6 text-center relative z-10">
                <span
                    className="inline-block text-xs font-medium tracking-[0.3em] uppercase px-4 py-2 rounded-full mb-6"
                    style={{
                        color: 'var(--accent-copper)',
                        border: '1px solid rgba(196,149,106,0.3)',
                    }}
                >
                    Start Your Journey
                </span>

                <h2
                    className="text-3xl md:text-5xl font-bold mb-6"
                    style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}
                >
                    Ready to Invest in Your <span style={{ color: 'var(--accent-copper)' }}>Future</span>?
                </h2>

                <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: '#C0B8AE' }}>
                    Let our experts guide you through the best land investment opportunities.
                    Schedule a free consultation today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/contact" className="btn btn-primary px-8 py-4">
                        Schedule Consultation
                    </Link>
                    <Link
                        href="/properties"
                        className="btn px-8 py-4"
                        style={{
                            background: 'transparent',
                            color: '#F5F0EB',
                            border: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        Browse Properties
                    </Link>
                </div>
            </div>
        </section>
    );
}
