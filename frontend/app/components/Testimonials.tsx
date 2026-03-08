'use client';

export default function Testimonials() {
    const testimonials = [
        {
            name: 'Rajesh Sharma',
            role: 'Investor since 2023',
            text: 'SKI has transformed the way I look at real estate investment. The earning plan is transparent, and I can track everything from my dashboard. Already at Rank 3!',
            initials: 'RS',
            color: '#C4956A',
        },
        {
            name: 'Priya Gupta',
            role: 'Team Leader',
            text: 'The team bonus structure is incredible. I started with a small investment and now my team generates consistent returns. The real-time dashboard makes it so easy.',
            initials: 'PG',
            color: '#60A5FA',
        },
        {
            name: 'Amit Khandelwal',
            role: 'Senior Investor',
            text: 'What sets SKI apart is their RERA registered properties and complete transparency. I\'ve been investing for 2 years and the returns have been exceptional.',
            initials: 'AK',
            color: '#34D399',
        },
    ];

    return (
        <section style={{ padding: '80px 24px', background: 'var(--bg-surface)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span style={{
                        display: 'inline-block', padding: '5px 16px', borderRadius: '50px',
                        background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.2)',
                        fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                        marginBottom: '16px',
                    }}>Testimonials</span>
                    <h2 style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700,
                        color: 'var(--text-heading)', lineHeight: 1.2,
                    }}>
                        What Our <span style={{ color: '#C4956A' }}>Investors Say</span>
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {testimonials.map(t => (
                        <div
                            key={t.name}
                            style={{
                                padding: '28px 24px', borderRadius: '16px',
                                background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                position: 'relative',
                            }}
                        >
                            {/* Quote mark */}
                            <div style={{
                                position: 'absolute', top: '16px', right: '20px',
                                fontSize: '3rem', fontFamily: 'Georgia, serif',
                                color: t.color, opacity: 0.1, lineHeight: 1,
                            }}>&ldquo;</div>

                            <p style={{
                                fontSize: '0.85rem', color: 'var(--text-muted)',
                                lineHeight: 1.7, fontFamily: 'var(--font-inter), sans-serif',
                                marginBottom: '20px', fontStyle: 'italic',
                            }}>
                                &ldquo;{t.text}&rdquo;
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 800, color: '#fff',
                                    fontFamily: 'var(--font-inter)', letterSpacing: '0.05em',
                                }}>{t.initials}</div>
                                <div>
                                    <div style={{
                                        fontWeight: 600, fontSize: '0.85rem',
                                        color: 'var(--text-heading)',
                                        fontFamily: 'var(--font-inter), sans-serif',
                                    }}>{t.name}</div>
                                    <div style={{
                                        fontSize: '0.7rem', color: t.color,
                                        fontFamily: 'var(--font-inter), sans-serif',
                                    }}>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
