'use client';

import { useEffect, useState } from 'react';
import { getUserDashboard } from '../lib/api';
import useSWR from 'swr';
import { useSocket } from '../../../lib/SocketContext';

export default function UserDashboardPage() {
    const [copied, setCopied] = useState('');
    const { socket } = useSocket();

    const fetchDashboard = async () => {
        const res = await getUserDashboard();
        return res.data;
    };

    const { data, isLoading: loading, mutate: loadData } = useSWR('user_dashboard', fetchDashboard);

    // Real-time: refresh dashboard when investments change
    useEffect(() => {
        const handleUpdate = () => loadData();
        socket.on('investment:updated', handleUpdate);
        socket.on('profit:updated', handleUpdate);
        return () => {
            socket.off('investment:updated', handleUpdate);
            socket.off('profit:updated', handleUpdate);
        };
    }, [socket, loadData]);

    const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000); };
    const shareWhatsApp = () => {
        const msg = encodeURIComponent(`🏗️ Join SKI (Shree Khandelwal Infra) — India's trusted real estate investment platform!\n\nSign up using my referral link:\n${data?.referralLink}\n\nReferral Code: ${data?.referralCode}\n\nStart your investment journey today! 💰`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };
    const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}><div className="skeleton" style={{ width: '200px', height: '16px' }} /></div>;
    if (!data) return null;

    const isPending = data.status === 'PENDING';
    const stats = [
        { label: 'Self Investment', value: fmt(data.selfInvestment), accent: 'var(--accent-copper)' },
        { label: 'Team Business', value: fmt(data.totalBusiness), accent: '#60A5FA' },
        { label: 'Team Bonus', value: fmt(data.teamBonus), accent: '#34D399' },
        { label: 'Self Reward', value: fmt(data.selfReward), accent: '#FBBF24' },
        { label: 'Direct Bonus', value: fmt(data.directBonus), accent: '#F472B6' },
        { label: 'Total Income', value: fmt(data.totalIncome), accent: '#7C3AED' },
    ];

    return (
        <div>
            {/* Pending Activation Banner */}
            {isPending && (
                <div style={{
                    borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
                    border: '1px solid rgba(245,158,11,0.25)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⏳</div>
                        <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-playfair), Georgia, serif' }}>Account Pending Activation</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif', marginTop: '2px' }}>
                                Your account is awaiting admin approval. Investments, team, and profit features are locked until activation.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Referral Card */}
            <div className="card" style={{ borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div className="section-label" style={{ fontSize: '0.65rem' }}>Your Referral</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                    {[{ k: 'id', l: 'Referral ID', v: data.referralCode }, { k: 'link', l: 'Referral Link', v: data.referralLink }].map(f => (
                        <div key={f.k}>
                            <label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{f.l}</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div className="input" style={{ flex: 1, fontFamily: f.k === 'id' ? 'monospace' : undefined, fontSize: '0.85rem', padding: '0.6rem 0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.v}</div>
                                <button onClick={() => copyText(f.v, f.k)} className={copied === f.k ? '' : 'btn-copper-outline'} style={{ padding: '0.6rem 1rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid', fontFamily: 'var(--font-inter), sans-serif', background: copied === f.k ? '#34D399' : 'transparent', borderColor: copied === f.k ? '#34D399' : 'var(--accent-copper)', color: copied === f.k ? '#fff' : 'var(--accent-copper)', transition: 'all 0.2s' }}>
                                    {copied === f.k ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={shareWhatsApp} className="btn" style={{ background: '#25D366', color: '#fff', borderRadius: '6px', padding: '0.6rem 1.2rem', fontSize: '0.75rem', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}>
                        Share via WhatsApp
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map(s => (
                    <div key={s.label} className="card" style={{ borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--border-color)', transition: 'all 0.35s ease', cursor: 'default' }}>
                        <div className="text-tracked" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{s.label}</div>
                        <div className="heading-serif" style={{ fontSize: '1.25rem', color: s.accent }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Rank Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Team Business Rank */}
                <div className="card" style={{ borderRadius: '10px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="text-tracked" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Team Business Rank</div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-copper-subtle)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-copper)' }}>{data.rank}</div>
                    </div>
                    {data.rankConfig && (<>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Range</span><span style={{ color: 'var(--text-primary)' }}>{fmt(data.rankConfig.teamBusinessMin)} — {fmt(data.rankConfig.teamBusinessMax)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Commission</span><span style={{ color: '#34D399' }}>{data.rankConfig.commissionPct}%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Reward</span><span style={{ color: 'var(--accent-copper)' }}>{data.rankConfig.rewardName}</span></div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-surface-alt)' }}>
                                <div style={{ height: '100%', borderRadius: '3px', transition: 'width 0.7s ease', width: `${Math.min(100, (data.totalBusiness / data.rankConfig.teamBusinessMax) * 100)}%`, background: 'linear-gradient(90deg, var(--accent-copper), var(--accent-copper-light))' }} />
                            </div>
                            <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>{fmt(data.totalBusiness)} / {fmt(data.rankConfig.teamBusinessMax)}</div>
                        </div>
                    </>)}
                </div>

                {/* Self Investment Rank */}
                {(() => {
                    const invRank = data.investmentRank || 1;
                    const invRankConfig = data.allRanks?.find((r: any) => r.rank === invRank);
                    const nextInvRankConfig = data.allRanks?.find((r: any) => r.rank === invRank + 1);
                    const targetInvestment = nextInvRankConfig?.selfInvestment || invRankConfig?.selfInvestment || 0;
                    return (
                        <div className="card" style={{ borderRadius: '10px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div className="text-tracked" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Self Investment Rank</div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.1)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1rem', color: '#60A5FA' }}>{invRank}</div>
                            </div>
                            {invRankConfig && (<>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Current Rank Req.</span><span style={{ color: 'var(--text-primary)' }}>{fmt(invRankConfig.selfInvestment)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Your Investment</span><span style={{ color: '#60A5FA' }}>{fmt(data.selfInvestment)}</span></div>
                                    {nextInvRankConfig && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Next Rank Req.</span><span style={{ color: '#7C3AED' }}>{fmt(nextInvRankConfig.selfInvestment)}</span></div>}
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-surface-alt)' }}>
                                        <div style={{ height: '100%', borderRadius: '3px', transition: 'width 0.7s ease', width: `${Math.min(100, targetInvestment > 0 ? (data.selfInvestment / targetInvestment) * 100 : 100)}%`, background: 'linear-gradient(90deg, #60A5FA, #3B82F6)' }} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>{fmt(data.selfInvestment)} / {fmt(targetInvestment)}</div>
                                </div>
                            </>)}
                        </div>
                    );
                })()}
            </div>

            {/* Team Size */}
            <div className="card" style={{ borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter), sans-serif' }}>Total Team Members</span>
                <span className="heading-serif" style={{ fontSize: '1.5rem', color: 'var(--accent-copper)' }}>{data.teamSize}</span>
            </div>
        </div>
    );
}
