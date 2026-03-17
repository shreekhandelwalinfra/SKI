'use client';

import { useEffect, useState } from 'react';

const ranks = [
    { rank: 1, teamBusiness: '0 – 5 Lakh', commission: '3%', selfInvestment: '₹5 Lakh', reward: 'Mobile', rewardValue: '₹5,000' },
    { rank: 2, teamBusiness: '5 – 25 Lakh', commission: '5%', selfInvestment: '₹7.5 Lakh', reward: 'LED TV', rewardValue: '₹20,000' },
    { rank: 3, teamBusiness: '25 – 50 Lakh', commission: '7%', selfInvestment: '₹10 Lakh', reward: 'Motorbike', rewardValue: '₹50,000' },
    { rank: 4, teamBusiness: '50 Lakh – 1 Cr', commission: '9%', selfInvestment: '₹25 Lakh', reward: 'Car', rewardValue: '₹3,00,000' },
    { rank: 5, teamBusiness: '1 – 5 Cr', commission: '11%', selfInvestment: '₹35 Lakh', reward: 'Swift Car', rewardValue: '₹5,00,000' },
    { rank: 6, teamBusiness: '5 – 10 Cr', commission: '13%', selfInvestment: '₹50 Lakh', reward: 'Scorpio', rewardValue: '₹10,00,000' },
    { rank: 7, teamBusiness: '10 – 25 Cr', commission: '14%', selfInvestment: '₹1 Cr', reward: 'Fortuner', rewardValue: '₹25,00,000' },
    { rank: 8, teamBusiness: '25 – 50 Cr', commission: '15%', selfInvestment: '₹2.5 Cr', reward: 'BMW', rewardValue: '₹50,00,000' },
    { rank: 9, teamBusiness: '50 – 75 Cr', commission: '16%', selfInvestment: '₹5 Cr', reward: 'Apartment', rewardValue: '₹75 Lakh' },
    { rank: 10, teamBusiness: '75 – 100 Cr', commission: '17%', selfInvestment: '₹10 Cr', reward: 'Villa', rewardValue: '₹1 Cr' },
];

export default function UserEarningPlanPage() {
    const [isApproved, setIsApproved] = useState(false);
    const [userRank, setUserRank] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem('user-data');
            if (stored) {
                const u = JSON.parse(stored);
                const status = (u.status || '').toLowerCase();
                if (status === 'active') {
                    setIsApproved(true);
                    setUserRank(u.rank || 0);
                }
            }
        } catch { }
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Earning Plan</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Understand the SKI commission structure and your milestone rewards.</p>
            </div>

            {!isApproved ? (
                /* ═══════ LOCKED CTA (Teaser for Pending Users) ═══════ */
                <div style={{
                    padding: '60px 24px', borderRadius: '16px',
                    background: 'linear-gradient(160deg, #0D0D18 0%, #111827 50%, #1B2A4A 100%)',
                    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                        {/* Lock Icon */}
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(196,149,106,0.15), rgba(196,149,106,0.05))',
                            border: '2px solid rgba(196,149,106,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 28px',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>

                        <h2 style={{
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                            fontSize: '1.6rem', fontWeight: 700, color: '#F5F0EB',
                            marginBottom: '12px', lineHeight: 1.3,
                        }}>
                            Unlock the Full Earning Plan
                        </h2>

                        <p style={{ fontSize: '0.92rem', color: '#8888A0', lineHeight: 1.7, marginBottom: '8px' }}>
                            Your account is currently <span style={{ color: '#FBBF24', fontWeight: 600 }}>pending approval</span>.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#6B6B80', lineHeight: 1.7, marginBottom: '32px' }}>
                            The complete rank chart, commission structure, and reward details will be unlocked once the admin activates your account. Please wait for activation.
                        </p>

                        {/* Decorative rank preview pills */}
                        <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0.3 }}>
                            {Array.from({ length: 10 }, (_, i) => (
                                <span key={i} style={{
                                    padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem',
                                    background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.12)',
                                    color: '#C4956A', fontWeight: 600,
                                }}>R{i + 1}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* ═══════════ RANK TABLE (Active users only) ═══════════ */}
                    <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>Rank &amp; Rewards Chart</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Your effective rank is the lower of your personal investment rank and your team business rank.
                            </p>
                        </div>

                        <div className="overflow-scroll-x" style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px', fontFamily: 'var(--font-inter), sans-serif' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-primary)' }}>
                                        {['Rank', 'Team Business', 'Commission', 'Self-Investment', 'Reward'].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-color)' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranks.map((r, i) => {
                                        const tc = r.rank <= 3 ? '#C4956A' : r.rank <= 6 ? '#60A5FA' : r.rank <= 8 ? '#A855F7' : '#FBBF24';
                                        const isCurrentRank = r.rank === userRank;
                                        return (
                                            <tr key={r.rank} style={{
                                                background: isCurrentRank ? 'var(--accent-copper-subtle)' : i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-primary)',
                                                borderBottom: '1px solid var(--border-subtle)',
                                            }}>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: `${tc}15`, color: tc, fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-playfair)' }}>{r.rank}</span>
                                                    {isCurrentRank && (
                                                        <span style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-copper)', color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>YOU</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: isCurrentRank ? 700 : 500, color: isCurrentRank ? 'var(--accent-copper)' : 'var(--text-primary)', fontSize: '0.84rem' }}>{r.teamBusiness}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(52,211,153,0.1)', color: '#34D399', fontWeight: 700, fontSize: '0.84rem' }}>{r.commission}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--accent-copper)', fontSize: '0.84rem' }}>{r.selfInvestment}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.84rem' }}>{r.reward}</span>
                                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '4px' }}>({r.rewardValue})</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ═══════════ COMMISSION TYPES ═══════════ */}
                    <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '20px' }}>Types of Income</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            {[
                                { icon: '💵', title: 'Direct Bonus', subtitle: 'On personal referrals', color: '#34D399', desc: 'Earn direct commission on every personal referral based on your rank (starting at 3%).' },
                                { icon: '👥', title: 'Team Bonus', subtitle: 'Level difference income', color: '#60A5FA', desc: 'Earn the difference between your rank % and your downline\'s rank % across your network.' },
                                { icon: '🏆', title: 'Self Reward', subtitle: 'Rank bonuses', color: '#FBBF24', desc: 'Unlock a milestone reward each time you step up to a new rank.' },
                            ].map(item => (
                                <div key={item.title} style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderTop: `3px solid ${item.color}` }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}12`, fontSize: '1.1rem', marginBottom: '12px' }}>
                                        {item.icon}
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '4px' }}>
                                        {item.title} <span style={{ fontSize: '0.65rem', color: item.color, fontWeight: 500, fontFamily: 'var(--font-inter)' }}>({item.subtitle})</span>
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
