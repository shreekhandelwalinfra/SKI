'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

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

export default function EarningPlanPage() {
    const [isApproved, setIsApproved] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [userRank, setUserRank] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const token = localStorage.getItem('user-token');
            const stored = localStorage.getItem('user-data');
            if (token && stored) {
                setIsLoggedIn(true);
                const u = JSON.parse(stored);
                const status = (u.status || '').toLowerCase();
                if (status === 'active') {
                    setIsApproved(true);
                    setUserRank(u.rank || 0);
                } else {
                    setIsPending(true);
                }
            }
        } catch { }
    }, []);

    return (
        <>
            <Navbar />
            <main>
                {/* ═══════════ HERO ═══════════ */}
                <section
                    style={{
                        paddingTop: '160px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px',
                        background: 'linear-gradient(160deg, #0a0a12 0%, #111827 40%, #1B2A4A 70%, #0D0D18 100%)',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                        <div
                            style={{
                                display: 'inline-block', padding: '6px 18px', borderRadius: '20px',
                                background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.2)',
                                fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                                color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                                marginBottom: '20px',
                            }}
                        >
                            SKI Earning Plan
                        </div>
                        <h1
                            style={{
                                fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)',
                                fontWeight: 700, color: '#F5F0EB', lineHeight: 1.15, marginBottom: '16px',
                            }}
                        >
                            Invest. Refer. <span style={{ color: '#C4956A' }}>Earn.</span>
                        </h1>
                        <p
                            style={{
                                fontSize: '1rem', color: '#8888A0', lineHeight: 1.8,
                                fontFamily: 'var(--font-inter), sans-serif', maxWidth: '540px', margin: '0 auto',
                            }}
                        >
                            A transparent, rank-based earning model built around
                            real estate investment. Grow your network and unlock
                            commissions &amp; milestone rewards at every level.
                        </p>
                    </div>
                </section>

                {/* ═══════════ HOW IT WORKS ═══════════ */}
                <section style={{ padding: '80px 24px', background: 'var(--bg-primary)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <span className="section-label">The Model</span>
                            <h2 className="section-title">How It Works</h2>
                            <div className="copper-line copper-line-center" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {[
                                { num: '01', title: 'You Invest', color: '#C4956A', desc: 'Make a self-investment in any verified SKI property. Your investment amount determines your rank eligibility and unlocks commission earning.' },
                                { num: '02', title: 'You Refer', color: '#34D399', desc: 'Share your unique referral link with others. When they join and invest through your link, they become part of your downline team network.' },
                                { num: '03', title: 'You Earn', color: '#60A5FA', desc: 'Earn direct bonus on every referral\'s investment, plus team bonus from your entire downline. Achieve ranks to unlock milestone rewards.' },
                            ].map(item => (
                                <div
                                    key={item.num}
                                    style={{
                                        position: 'relative', padding: '32px 28px 28px',
                                        background: 'var(--bg-surface)', borderRadius: '16px',
                                        border: '1px solid var(--border-color)',
                                        borderTop: `3px solid ${item.color}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute', top: '20px', right: '24px',
                                            fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)',
                                            color: item.color, opacity: 0.08, lineHeight: 1,
                                        }}
                                    >
                                        {item.num}
                                    </div>
                                    <div
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: `${item.color}15`, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 800, color: item.color,
                                            fontFamily: 'var(--font-inter), sans-serif', marginBottom: '16px',
                                        }}
                                    >
                                        {item.num}
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700,
                                            fontSize: '1.15rem', color: 'var(--text-heading)', marginBottom: '10px',
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════ GATED CONTENT ═══════════ */}
                {mounted && !isApproved ? (
                    /* ═══════ LOCKED CTA (Teaser) ═══════ */
                    <section style={{
                        padding: '100px 24px',
                        background: 'linear-gradient(160deg, #0D0D18 0%, #111827 50%, #1B2A4A 100%)',
                        textAlign: 'center',
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

                            {isPending ? (
                                <>
                                    <p style={{ fontSize: '0.92rem', color: '#8888A0', lineHeight: 1.7, marginBottom: '8px' }}>
                                        Your account is <span style={{ color: '#FBBF24', fontWeight: 600 }}>pending approval</span>.
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#6B6B80', lineHeight: 1.7, marginBottom: '32px' }}>
                                        The complete rank chart, commission structure, and reward details will be unlocked once the admin activates your account.
                                    </p>
                                    <Link
                                        href="/user/dashboard"
                                        style={{
                                            display: 'inline-block', padding: '14px 36px', borderRadius: '12px',
                                            background: 'linear-gradient(135deg, rgba(196,149,106,0.15), rgba(196,149,106,0.08))',
                                            border: '1px solid rgba(196,149,106,0.3)',
                                            color: '#C4956A', fontSize: '0.9rem', fontWeight: 600,
                                            textDecoration: 'none', fontFamily: 'var(--font-inter), sans-serif',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Go to Dashboard
                                    </Link>
                                </>
                            ) : isLoggedIn ? (
                                <>
                                    <p style={{ fontSize: '0.92rem', color: '#8888A0', lineHeight: 1.7, marginBottom: '8px' }}>
                                        Your account is not yet active.
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#6B6B80', lineHeight: 1.7, marginBottom: '32px' }}>
                                        Please wait for admin approval to view the full earning plan with ranks, commissions, and rewards.
                                    </p>
                                    <Link
                                        href="/user/dashboard"
                                        style={{
                                            display: 'inline-block', padding: '14px 36px', borderRadius: '12px',
                                            background: 'linear-gradient(135deg, rgba(196,149,106,0.15), rgba(196,149,106,0.08))',
                                            border: '1px solid rgba(196,149,106,0.3)',
                                            color: '#C4956A', fontSize: '0.9rem', fontWeight: 600,
                                            textDecoration: 'none', fontFamily: 'var(--font-inter), sans-serif',
                                        }}
                                    >
                                        Go to Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: '0.92rem', color: '#8888A0', lineHeight: 1.7, marginBottom: '32px' }}>
                                        The detailed rank chart, commission percentages, self-investment requirements, and milestone rewards are available exclusively to approved SKI members.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <Link
                                            href="/user/login"
                                            style={{
                                                display: 'inline-block', padding: '14px 36px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                                                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                                                textDecoration: 'none', fontFamily: 'var(--font-inter), sans-serif',
                                                boxShadow: '0 4px 15px rgba(196,149,106,0.25)',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/user/signup"
                                            style={{
                                                display: 'inline-block', padding: '14px 36px', borderRadius: '12px',
                                                background: 'transparent',
                                                border: '1px solid rgba(196,149,106,0.3)',
                                                color: '#C4956A', fontSize: '0.9rem', fontWeight: 600,
                                                textDecoration: 'none', fontFamily: 'var(--font-inter), sans-serif',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                </>
                            )}

                            {/* Decorative rank preview pills */}
                            <div style={{ marginTop: '48px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0.3 }}>
                                {Array.from({ length: 10 }, (_, i) => (
                                    <span key={i} style={{
                                        padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem',
                                        background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.12)',
                                        color: '#C4956A', fontWeight: 600,
                                    }}>R{i + 1}</span>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#4A4A5A', marginTop: '12px' }}>
                                10 ranks • Team commissions • Milestone rewards
                            </p>
                        </div>
                    </section>
                ) : mounted ? (
                    <>
                        {/* ═══════════ RANK TABLE (Full — Active users only) ═══════════ */}
                        <section style={{ padding: '80px 24px', background: 'var(--bg-surface)' }}>
                            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <span className="section-label">Rank System</span>
                                    <h2 className="section-title">Rank &amp; Rewards Chart</h2>
                                    <div className="copper-line copper-line-center" />
                                    <p style={{ fontSize: '0.85rem', marginTop: '12px', color: 'var(--text-muted)', maxWidth: '500px', margin: '12px auto 0', lineHeight: 1.6 }}>
                                        Your effective rank = the lower of your investment rank
                                        and team business rank.
                                    </p>
                                </div>

                                <div
                                    className="overflow-scroll-x"
                                    style={{ borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 30px rgba(0,0,0,0.12)' }}
                                >
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px', fontFamily: 'var(--font-inter), sans-serif' }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg, #C4956A, #a87a50)' }}>
                                                {['Rank', 'Team Business', 'Commission', 'Self-Investment', 'Reward'].map(h => (
                                                    <th
                                                        key={h}
                                                        style={{
                                                            padding: '14px 16px', textAlign: 'center',
                                                            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                                                            letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                                                        }}
                                                    >
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
                                                    <tr
                                                        key={r.rank}
                                                        style={{
                                                            background: isCurrentRank
                                                                ? 'rgba(196,149,106,0.08)'
                                                                : i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-primary)',
                                                            borderBottom: '1px solid var(--border-subtle)',
                                                            ...(isCurrentRank ? {
                                                                outline: '2px solid rgba(196,149,106,0.5)',
                                                                outlineOffset: '-2px',
                                                                borderRadius: '4px',
                                                            } : {}),
                                                        }}
                                                    >
                                                        <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: `${tc}15`, color: tc, fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-playfair)' }}>{r.rank}</span>
                                                            {isCurrentRank && (
                                                                <span style={{
                                                                    position: 'absolute', top: '4px', right: '4px',
                                                                    fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px',
                                                                    background: 'rgba(196,149,106,0.15)', color: '#C4956A',
                                                                    fontWeight: 700, letterSpacing: '0.05em',
                                                                }}>YOU</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: isCurrentRank ? 700 : 500, color: isCurrentRank ? '#F5F0EB' : 'var(--text-primary)', fontSize: '0.84rem' }}>{r.teamBusiness}</td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(52,211,153,0.1)', color: '#34D399', fontWeight: 700, fontSize: '0.84rem' }}>{r.commission}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#C4956A', fontSize: '0.84rem' }}>{r.selfInvestment}</td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <span style={{ fontWeight: 600, color: isCurrentRank ? '#F5F0EB' : 'var(--text-heading)', fontSize: '0.84rem' }}>{r.reward}</span>
                                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '4px' }}>({r.rewardValue})</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '8px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 500 }}>
                                        ⚠️ You must meet <strong>both</strong> the self-investment and team business targets to qualify for each rank&apos;s reward.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ COMMISSION TYPES ═══════════ */}
                        <section style={{ padding: '80px 24px', background: 'var(--bg-primary)' }}>
                            <div style={{ maxWidth: '880px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <span className="section-label">Earnings</span>
                                    <h2 className="section-title">Types of Income</h2>
                                    <div className="copper-line copper-line-center" />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        {
                                            icon: '💵', title: 'Direct Bonus', subtitle: 'On personal referrals', color: '#34D399',
                                            desc: 'When someone you personally referred invests, you receive a direct commission on their investment amount based on your rank (starting at 3%).',
                                            example: 'Referral invests ₹10 Lakh → You earn ₹30,000 (at 3%)',
                                        },
                                        {
                                            icon: '👥', title: 'Team Bonus', subtitle: 'Level difference income', color: '#60A5FA',
                                            desc: 'You earn the difference between your rank commission % and your downline\'s rank %, applied to their investment. This works across your entire network.',
                                            example: 'You: Rank 5 (11%) · Downline: Rank 2 (5%) → 6% of their investment',
                                        },
                                        {
                                            icon: '🏆', title: 'Self Reward', subtitle: 'Rank achievement bonus', color: '#FBBF24',
                                            desc: 'Every time you achieve a new rank, you unlock a milestone reward — from a ₹5,000 mobile at Rank 1 all the way to a ₹1 Crore villa at Rank 10.',
                                            example: 'Rank 1 → Mobile (₹5K) · · · Rank 10 → Villa (₹1 Cr)',
                                        },
                                    ].map(item => (
                                        <div
                                            key={item.title}
                                            style={{
                                                display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap',
                                                padding: '24px 28px', borderRadius: '14px',
                                                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                                                borderLeft: `4px solid ${item.color}`,
                                            }}
                                        >
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}12`, fontSize: '1.2rem' }}>
                                                {item.icon}
                                            </div>
                                            <div style={{ flex: 1, minWidth: '220px' }}>
                                                <h3 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-heading)', marginBottom: '2px' }}>
                                                    {item.title}
                                                    <span style={{ fontSize: '0.68rem', color: item.color, fontWeight: 500, fontFamily: 'var(--font-inter)', marginLeft: '8px' }}>({item.subtitle})</span>
                                                </h3>
                                                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '10px' }}>{item.desc}</p>
                                                <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px dashed var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    <strong style={{ color: item.color }}>{item.example}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ CONTACT ═══════════ */}
                        <section style={{ padding: '60px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #1B2A4A 0%, #0F0F14 100%)' }}>
                            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#F5F0EB', marginBottom: '10px' }}>
                                    Have Questions?
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#8888A0', marginBottom: '24px', lineHeight: 1.6 }}>
                                    Reach out for a detailed walkthrough of the earning plan.
                                </p>
                                <a
                                    href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-block', padding: '12px 32px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #C4956A, #a87a50)', color: '#fff',
                                        fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
                                        fontFamily: 'var(--font-inter), sans-serif',
                                        boxShadow: '0 4px 15px rgba(196,149,106,0.2)',
                                    }}
                                >
                                    WhatsApp Us
                                </a>
                            </div>
                        </section>
                    </>
                ) : null}
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
