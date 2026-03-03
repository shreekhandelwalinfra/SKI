import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata: Metadata = {
    title: 'About Us – Shree Khandelwal Infra',
    description: 'Learn about Shree Khandelwal Infra (SKI) — 15+ years of excellence in real estate and land investments across Noida, Greater Noida, Jewar, Mathura & Vrindavan.',
};

const milestones = [
    { year: '2008', event: 'Founded with a vision to make premium real estate accessible' },
    { year: '2012', event: 'Expanded to Mathura-Vrindavan — 80+ projects delivered' },
    { year: '2016', event: 'Crossed 200+ successful property deliveries across UP' },
    { year: '2020', event: 'Entered Jewar Airport zone — strategic land investments' },
    { year: '2024', event: '500+ properties delivered with Pan-India broker network' },
];

const values = [
    { icon: '🛡️', title: 'Trust & Transparency', desc: 'Every property we list is verified for clear title, legal compliance, and fair pricing. No hidden charges, ever.' },
    { icon: '🎯', title: 'Quality First', desc: 'We handpick only premium locations with high growth potential — near upcoming infrastructure, highways, and metro corridors.' },
    { icon: '🤝', title: 'Investor Success', desc: 'Our success is measured by our investors\' success. We provide end-to-end support from purchase to documentation.' },
];

const team = [
    { icon: '👔', name: 'Management Team', role: 'Strategic Leadership', desc: 'Decades of combined experience driving real estate development and investment strategy.' },
    { icon: '⚖️', name: 'Legal Team', role: 'Compliance & Documentation', desc: 'Expert legal advisors ensuring complete regulatory compliance and clear property titles.' },
    { icon: '📈', name: 'Sales Team', role: 'Client Relations', desc: 'Dedicated relationship managers providing personalized guidance at every step.' },
];

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main>
                {/* ═══ HERO ═══ */}
                <section
                    style={{
                        paddingTop: '160px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px',
                        background: 'linear-gradient(160deg, #0a0a12 0%, #111827 40%, #1B2A4A 70%, #0D0D18 100%)',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-block', padding: '6px 20px', borderRadius: '50px',
                            background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.2)',
                            fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                            color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                            marginBottom: '24px',
                        }}>
                            About Us
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700,
                            color: '#F5F0EB', lineHeight: 1.15, marginBottom: '16px',
                        }}>
                            Building Trust Through <span style={{ color: '#C4956A' }}>Transparency</span>
                        </h1>
                        <p style={{
                            fontSize: '0.95rem', color: '#8888A0', lineHeight: 1.8,
                            fontFamily: 'var(--font-inter), sans-serif', maxWidth: '520px', margin: '0 auto',
                        }}>
                            Since 2008, SKI has been empowering investors with verified,
                            high-quality land opportunities across North India&apos;s fastest-growing corridors.
                        </p>
                    </div>
                </section>

                {/* ═══ MISSION & VISION ═══ */}
                <section style={{ padding: '80px 24px', background: 'var(--bg-primary)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div style={{
                                padding: '36px 32px', borderRadius: '16px', background: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)', borderTop: '3px solid #C4956A',
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🎯</div>
                                <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '12px' }}>
                                    Our Mission
                                </h2>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                                    To bridge the gap between premium land opportunities and aspiring investors.
                                    We make verified real estate accessible to everyone — with complete transparency,
                                    expert guidance, and an unwavering commitment to quality.
                                </p>
                            </div>
                            <div style={{
                                padding: '36px 32px', borderRadius: '16px', background: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)', borderTop: '3px solid #60A5FA',
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🔭</div>
                                <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '12px' }}>
                                    Our Vision
                                </h2>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                                    To be the most trusted name in North Indian real estate — known for integrity,
                                    premium offerings, and making property investment seamless and rewarding
                                    for every client who partners with us.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ VALUES ═══ */}
                <section style={{ padding: '80px 24px', background: 'var(--bg-surface)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <span className="section-label">Our Values</span>
                            <h2 className="section-title">Why Investors Choose SKI</h2>
                            <div className="copper-line copper-line-center" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {values.map((v, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                                    padding: '24px', borderRadius: '14px',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(196,149,106,0.08)', fontSize: '1.2rem',
                                    }}>
                                        {v.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '6px' }}>
                                            {v.title}
                                        </h3>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ MILESTONES ═══ */}
                <section style={{ padding: '80px 24px', background: 'var(--bg-primary)' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <span className="section-label">Our Journey</span>
                            <h2 className="section-title">Milestones</h2>
                            <div className="copper-line copper-line-center" />
                        </div>
                        <div style={{ position: 'relative', paddingLeft: '32px' }}>
                            {/* Vertical line */}
                            <div style={{
                                position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px',
                                background: 'linear-gradient(to bottom, #C4956A, rgba(196,149,106,0.1))',
                            }} />

                            {milestones.map((m, i) => (
                                <div key={i} style={{ position: 'relative', marginBottom: i < milestones.length - 1 ? '32px' : 0 }}>
                                    {/* Dot */}
                                    <div style={{
                                        position: 'absolute', left: '-29px', top: '4px',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: '#C4956A', border: '3px solid var(--bg-primary)',
                                    }} />
                                    <div style={{
                                        padding: '16px 20px', borderRadius: '12px',
                                        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                                    }}>
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em',
                                            color: '#C4956A', fontFamily: 'var(--font-playfair)',
                                        }}>
                                            {m.year}
                                        </span>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                                            {m.event}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ TEAM ═══ */}
                <section style={{ padding: '80px 24px', background: 'var(--bg-surface)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <span className="section-label">Our People</span>
                            <h2 className="section-title">Expert Teams</h2>
                            <div className="copper-line copper-line-center" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {team.map((t, i) => (
                                <div key={i} style={{
                                    textAlign: 'center', padding: '36px 28px', borderRadius: '16px',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(196,149,106,0.08)', fontSize: '1.4rem',
                                    }}>
                                        {t.icon}
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-heading)', marginBottom: '4px' }}>
                                        {t.name}
                                    </h3>
                                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4956A', fontWeight: 600, marginBottom: '12px' }}>
                                        {t.role}
                                    </p>
                                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{t.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
