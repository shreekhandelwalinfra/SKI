'use client';

import { useEffect, useState } from 'react';
import { getSelfReward, getTeamBonusProfit, getDirectBonusProfit } from '../lib/api';
import useSWR from 'swr';
import { useSocket } from '../../../lib/SocketContext';

export default function ProfitSummaryPage() {
    const [tab, setTab] = useState<'self' | 'team' | 'direct'>('self');
    const { socket } = useSocket();

    const fetchAll = async () => {
        const [selfRes, teamRes, directRes] = await Promise.all([getSelfReward(), getTeamBonusProfit(), getDirectBonusProfit()]);
        return { self: selfRes.data, team: teamRes.data, direct: directRes.data };
    };

    const { data, isLoading: loading, mutate: loadAll } = useSWR('user_profit', fetchAll);
    const selfData = data?.self || null;
    const teamData = data?.team || [];
    const directData = data?.direct || [];

    useEffect(() => {
        socket.on('investment:updated', loadAll);
        return () => { socket.off('investment:updated', loadAll); };
    }, [socket, loadAll]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const sBadge = (s: string) => s === 'PAID' ? { bg: 'rgba(52,211,153,0.1)', c: '#34D399' } : s === 'APPROVED' ? { bg: 'rgba(96,165,250,0.1)', c: '#60A5FA' } : s === 'REJECTED' ? { bg: 'rgba(239,68,68,0.1)', c: '#ef4444' } : { bg: 'rgba(251,191,36,0.1)', c: '#FBBF24' };
    const thStyle = { textAlign: 'left' as const, padding: '0.75rem 1.25rem', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 as const };
    const tdStyle = { padding: '0.85rem 1.25rem' };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}><div className="skeleton" style={{ width: '200px', height: '16px' }} /></div>;

    return (
        <div>
            <div className="section-label" style={{ fontSize: '0.65rem' }}>Earnings</div>
            <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '1.5rem' }}>Profit Summary</h2>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[{ l: 'Self Reward', v: selfData?.user?.selfReward || 0, a: '#FBBF24' }, { l: 'Team Bonus', v: selfData?.user?.teamBonus || 0, a: '#34D399' }, { l: 'Direct Bonus', v: selfData?.user?.directBonus || 0, a: '#F472B6' }].map(s => (
                    <div key={s.l} className="card" style={{ borderRadius: '10px', padding: '1.25rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                        <div className="text-tracked" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{s.l}</div>
                        <div className="heading-serif" style={{ fontSize: '1.2rem', color: s.a }}>{fmt(s.v)}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {[{ k: 'self', l: 'Self Reward' }, { k: 'team', l: 'Team Bonus' }, { k: 'direct', l: 'Direct Bonus' }].map(t => (
                    <button key={t.k} onClick={() => setTab(t.k as any)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', border: '1px solid', borderColor: tab === t.k ? 'var(--accent-copper)' : 'var(--border-color)', background: tab === t.k ? 'var(--accent-copper)' : 'transparent', color: tab === t.k ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                        {t.l}
                    </button>
                ))}
            </div>

            {/* Self Reward */}
            {tab === 'self' && (<div>
                {selfData && (
                    <div className="card" style={{ borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="section-label" style={{ fontSize: '0.65rem', marginBottom: 0 }}>Effective Reward Rank</div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(52,211,153,0.1)', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1rem', color: '#34D399' }}>{selfData.eligibleRank || 0}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: selfData.bottleneck === 'Investment' ? 'var(--bg-surface-alt)' : 'rgba(239,68,68,0.05)', border: '1px solid', borderColor: selfData.bottleneck === 'Investment' ? 'var(--border-subtle)' : 'rgba(239,68,68,0.2)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team Business Rank {selfData.bottleneck === 'Team Business' && <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: '0.5rem' }}>(BOTTLENECK)</span>}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>{selfData.volumeRank || 0}</div>
                            </div>
                            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: selfData.bottleneck === 'Team Business' || selfData.bottleneck === 'Equal' ? 'var(--bg-surface-alt)' : 'rgba(239,68,68,0.05)', border: '1px solid', borderColor: selfData.bottleneck === 'Team Business' || selfData.bottleneck === 'Equal' ? 'var(--border-subtle)' : 'rgba(239,68,68,0.2)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investment Rank {selfData.bottleneck === 'Investment' && <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: '0.5rem' }}>(BOTTLENECK)</span>}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>{selfData.investmentRank || 0}</div>
                            </div>
                        </div>

                        {selfData.nextRankConfig && (
                            <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-surface-alt)', border: '1px dashed var(--border-color)', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg className="w-4 h-4 text-copper" fill="none" viewBox="0 0 24 24" stroke="var(--accent-copper)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Next Target: Rank {selfData.nextRankConfig.rank} ({selfData.nextRankConfig.rewardName})
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Team Business Req.</span>
                                            <span style={{ color: (selfData.user?.totalBusiness || 0) >= selfData.nextRankConfig.teamBusinessMax ? '#34D399' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.75rem' }}>{fmt(selfData.user?.totalBusiness || 0)} / {fmt(selfData.nextRankConfig.teamBusinessMax)}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--bg-surface-alt)' }}>
                                            <div style={{ height: '100%', borderRadius: '2px', width: `${Math.min(100, ((selfData.user?.totalBusiness || 0) / selfData.nextRankConfig.teamBusinessMax) * 100)}%`, background: (selfData.user?.totalBusiness || 0) >= selfData.nextRankConfig.teamBusinessMax ? '#34D399' : 'var(--accent-copper)' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Self Investment Req.</span>
                                            <span style={{ color: (selfData.user?.selfInvestment || 0) >= selfData.nextRankConfig.selfInvestment ? '#34D399' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.75rem' }}>{fmt(selfData.user?.selfInvestment || 0)} / {fmt(selfData.nextRankConfig.selfInvestment)}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--bg-surface-alt)' }}>
                                            <div style={{ height: '100%', borderRadius: '2px', width: `${Math.min(100, ((selfData.user?.selfInvestment || 0) / selfData.nextRankConfig.selfInvestment) * 100)}%`, background: (selfData.user?.selfInvestment || 0) >= selfData.nextRankConfig.selfInvestment ? '#34D399' : 'var(--accent-copper)' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="card profit-table-wrap" style={{ border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                        <thead><tr style={{ background: 'var(--bg-surface-alt)' }}>{['#', 'Rank', 'Amount', 'Date', 'Remark', 'Status'].map(h => <th key={h} className="text-tracked" style={thStyle}>{h}</th>)}</tr></thead>
                        <tbody>{(selfData?.profits || []).length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records</td></tr> : (selfData?.profits || []).map((p: any, i: number) => {
                            const sb = sBadge(p.status);
                            const rankMatch = p.description?.match(/Rank (\d+)/);
                            const displayRank = p.brokerage || (rankMatch ? rankMatch[1] : '-');
                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td style={{ ...tdStyle, color: 'var(--accent-copper)', fontWeight: 600 }}>Rank {displayRank}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#34D399' }}>{fmt(p.amount)}</td>
                                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</td>
                                    <td style={{ ...tdStyle, color: 'var(--text-primary)' }}>{p.remark || '—'}</td>
                                    <td style={tdStyle}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, background: sb.bg, color: sb.c }}>{p.status}</span></td>
                                </tr>
                            );
                        })}</tbody>
                    </table>
                </div>
            </div>)}

            {/* Team Bonus */}
            {tab === 'team' && (<div className="card" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}><div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                    <thead><tr style={{ background: 'var(--bg-surface-alt)' }}>{['#', 'Teammate', 'ID', 'Rank', 'Diff %', 'Amount', 'TXN ID', 'Remark', 'Status'].map(h => <th key={h} className="text-tracked" style={{ ...thStyle, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                    <tbody>{teamData.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records</td></tr> : teamData.map((p: any, i: number) => { const sb = sBadge(p.status); return (<tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{i + 1}</td><td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)' }}>{p.fromUserName}</td><td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-copper)' }}>{p.fromUserUniqueId}</td><td style={tdStyle}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>R{p.fromUserRank}</span></td><td style={{ ...tdStyle, fontWeight: 600, color: '#60A5FA' }}>{p.differencePercentage}%</td><td style={{ ...tdStyle, fontWeight: 600, color: '#34D399' }}>{fmt(p.amount)}</td><td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.transactionId}</td><td style={{ ...tdStyle, color: 'var(--text-primary)' }}>{p.remark || '—'}</td><td style={tdStyle}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, background: sb.bg, color: sb.c }}>{p.status}</span></td></tr>); })}</tbody>
                </table>
            </div></div>)}

            {/* Direct Bonus */}
            {tab === 'direct' && (<div className="card" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}><div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                    <thead><tr style={{ background: 'var(--bg-surface-alt)' }}>{['#', 'Investment', 'Brokerage %', 'Commission', 'Date', 'Remark', 'Status'].map(h => <th key={h} className="text-tracked" style={{ ...thStyle, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                    <tbody>{directData.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records</td></tr> : directData.map((p: any, i: number) => { const sb = sBadge(p.status); return (<tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{i + 1}</td><td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(p.investmentAmount)}</td><td style={{ ...tdStyle, color: '#60A5FA' }}>{p.brokerage}%</td><td style={{ ...tdStyle, fontWeight: 600, color: '#34D399' }}>{fmt(p.commission)}</td><td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</td><td style={{ ...tdStyle, color: 'var(--text-primary)' }}>{p.remark || '—'}</td><td style={tdStyle}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, background: sb.bg, color: sb.c }}>{p.status}</span></td></tr>); })}</tbody>
                </table>
            </div></div>)}
        </div>
    );
}
