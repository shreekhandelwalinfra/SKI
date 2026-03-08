'use client';

export default function WhyChooseSKI() {
    const features = [
        {
            icon: '🏛️', title: 'RERA Registered',
            desc: 'All our properties are RERA verified, ensuring complete legal transparency and buyer protection.',
            color: '#C4956A',
        },
        {
            icon: '📊', title: 'Real-Time Dashboard',
            desc: 'Track your investments, team growth, and earnings in real-time through your personal dashboard.',
            color: '#60A5FA',
        },
        {
            icon: '💰', title: 'Transparent Earnings',
            desc: 'A clear rank-based commission system — know exactly how much you earn at every level.',
            color: '#34D399',
        },
        {
            icon: '🤝', title: 'Trusted Network',
            desc: 'Join 10,000+ investors who trust SKI for premium real estate investments and team-based growth.',
            color: '#A855F7',
        },
    ];

    return (
        <section style={{ padding: '80px 24px', background: 'var(--bg-primary)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span style={{
                        display: 'inline-block', padding: '5px 16px', borderRadius: '50px',
                        background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.2)',
                        fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                        marginBottom: '16px',
                    }}>Why SKI</span>
                    <h2 style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700,
                        color: 'var(--text-heading)', lineHeight: 1.2,
                    }}>
                        Why Investors <span style={{ color: '#C4956A' }}>Choose Us</span>
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {features.map(f => (
                        <div
                            key={f.title}
                            style={{
                                padding: '32px 24px', borderRadius: '16px',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                                textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: `${f.color}12`, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', margin: '0 auto 16px',
                            }}>{f.icon}</div>
                            <h3 style={{
                                fontFamily: 'var(--font-playfair), Georgia, serif',
                                fontWeight: 700, fontSize: '1rem',
                                color: 'var(--text-heading)', marginBottom: '8px',
                            }}>{f.title}</h3>
                            <p style={{
                                fontSize: '0.82rem', color: 'var(--text-muted)',
                                lineHeight: 1.65, fontFamily: 'var(--font-inter), sans-serif',
                            }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
