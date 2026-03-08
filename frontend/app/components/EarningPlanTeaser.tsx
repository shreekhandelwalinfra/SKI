'use client';

import Link from 'next/link';

export default function EarningPlanTeaser() {
    return (
        <section style={{
            padding: '80px 24px',
            background: 'linear-gradient(160deg, #0D0D18 0%, #111827 50%, #1B2A4A 100%)',
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <span style={{
                    display: 'inline-block', padding: '5px 16px', borderRadius: '50px',
                    background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.2)',
                    fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                    marginBottom: '16px',
                }}>Earning Plan</span>

                <h2 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700,
                    color: '#F5F0EB', lineHeight: 1.2, marginBottom: '16px',
                }}>
                    Invest. Refer. <span style={{ color: '#C4956A' }}>Earn Big.</span>
                </h2>

                <p style={{
                    fontSize: '0.92rem', color: '#8888A0', lineHeight: 1.7,
                    fontFamily: 'var(--font-inter), sans-serif',
                    maxWidth: '520px', margin: '0 auto 32px',
                }}>
                    Our transparent rank-based earning model rewards you at every step — from direct bonuses to team commissions and milestone rewards.
                </p>

                {/* Highlight pills */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
                    {[
                        { label: '10 Ranks', icon: '🏆', color: '#FBBF24' },
                        { label: 'Up to 17% Commission', icon: '💰', color: '#34D399' },
                        { label: 'Rewards up to ₹1 Cr', icon: '🎁', color: '#A855F7' },
                    ].map(item => (
                        <div key={item.label} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 18px', borderRadius: '50px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            fontSize: '0.8rem', fontWeight: 600, color: item.color,
                            fontFamily: 'var(--font-inter), sans-serif',
                        }}>
                            <span>{item.icon}</span> {item.label}
                        </div>
                    ))}
                </div>

                {/* Three income types */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                    {[
                        { title: 'Direct Bonus', desc: 'Earn commission on every personal referral\'s investment', color: '#34D399', icon: '💵' },
                        { title: 'Team Bonus', desc: 'Level difference income from your entire network', color: '#60A5FA', icon: '👥' },
                        { title: 'Self Reward', desc: 'Unlock milestone rewards from Mobile to Villa', color: '#FBBF24', icon: '🏆' },
                    ].map(item => (
                        <div key={item.title} style={{
                            padding: '24px 20px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{item.icon}</div>
                            <h3 style={{
                                fontFamily: 'var(--font-playfair)', fontWeight: 700,
                                fontSize: '0.95rem', color: item.color, marginBottom: '6px',
                            }}>{item.title}</h3>
                            <p style={{ fontSize: '0.78rem', color: '#8888A0', lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>

                <Link href="/earning-plan" style={{
                    display: 'inline-block', padding: '14px 36px', borderRadius: '50px',
                    background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                    color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-inter), sans-serif', textDecoration: 'none',
                    boxShadow: '0 4px 20px rgba(196,149,106,0.25)',
                }}>
                    View Full Earning Plan
                </Link>
            </div>
        </section>
    );
}
