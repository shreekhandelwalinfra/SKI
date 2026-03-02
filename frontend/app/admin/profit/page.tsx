'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getFirmProfit, getTeamBonus, getUserIncome } from '../lib/api';

type Tab = 'firm' | 'teamBonus' | 'userIncome';

export default function ProfitPage() {
    const [tab, setTab] = useState<Tab>('firm');
    const [firmProfits, setFirmProfits] = useState<any[]>([]);
    const [teamBonusData, setTeamBonusData] = useState<any[]>([]);
    const [userIncomeData, setUserIncomeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 'firm') {
                const res = await getFirmProfit();
                setFirmProfits(res.data);
            } else if (tab === 'teamBonus') {
                const res = await getTeamBonus();
                setTeamBonusData(res.data);
            } else {
                const res = await getUserIncome();
                setUserIncomeData(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [tab]);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
        socket.on('investment:updated', loadData);
        return () => { socket.disconnect(); };
    }, [tab]);

    const toggleTeam = (id: string) => {
        setExpandedTeams(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        {
            key: 'firm', label: 'Firm Profit',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
        },
        {
            key: 'teamBonus', label: 'Team Bonus',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
        },
        {
            key: 'userIncome', label: 'User Income',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
    ];

    const emptyState = (msg: string) => (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: '#7A7A8A', margin: '0 auto 1rem' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
            <div style={{ fontSize: '0.85rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif' }}>{msg}</div>
        </div>
    );

    return (
        <div className="animate-slideInUp">
            {/* Page header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#7A7A8A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '4px' }}>Financial</div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.04em' }}>Profit Overview</h1>
                <div style={{ marginTop: '6px', width: '40px', height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574)' }} />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 1.2rem', borderRadius: '8px', border: 'none',
                            fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em',
                            fontFamily: 'var(--font-inter), sans-serif', cursor: 'pointer',
                            background: tab === t.key ? '#C4956A' : 'rgba(196,149,106,0.08)',
                            color: tab === t.key ? '#fff' : '#7A7A8A',
                            borderBottom: tab === t.key ? 'none' : '1px solid rgba(196,149,106,0.12)',
                            boxShadow: tab === t.key ? '0 4px 16px rgba(196,149,106,0.3)' : 'none',
                            transition: 'all 0.25s ease',
                        }}
                    >
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.85rem' }}>
                    Loading data...
                </div>
            ) : (
                <>
                    {/* Firm Profit */}
                    {tab === 'firm' && (
                        firmProfits.length === 0 ? emptyState('No firm profit records yet.') : (
                            <div className="glass-card" style={{ overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                {['#', 'User', 'Amount', 'Description', 'Date'].map(h => (
                                                    <th key={h}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {firmProfits.map((p, i) => (
                                                <tr key={p.id}>
                                                    <td style={{ color: '#7A7A8A', fontSize: '0.75rem' }}>{i + 1}</td>
                                                    <td style={{ color: '#F5F0EB', fontWeight: 500 }}>{p.user?.name || '—'}</td>
                                                    <td>
                                                        <span style={{ color: '#10b981', fontWeight: 600 }}>{fmt(p.amount)}</span>
                                                    </td>
                                                    <td>{p.description || '—'}</td>
                                                    <td style={{ fontSize: '0.75rem', color: '#7A7A8A' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}

                    {/* Team Bonus */}
                    {tab === 'teamBonus' && (
                        teamBonusData.length === 0 ? emptyState('No team bonus records yet.') : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {teamBonusData.map(group => (
                                    <div key={group.teamLead.id} className="glass-card" style={{ overflow: 'hidden' }}>
                                        <button
                                            onClick={() => toggleTeam(group.teamLead.id)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between', padding: '1rem 1.25rem',
                                                background: expandedTeams[group.teamLead.id] ? 'rgba(196,149,106,0.06)' : 'transparent',
                                                border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
                                                    background: 'rgba(196,149,106,0.12)', border: '1px solid rgba(196,149,106,0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4956A',
                                                }}>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F5F0EB', fontFamily: 'var(--font-inter), sans-serif' }}>
                                                        {group.teamLead.name}
                                                        <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#C4956A', fontFamily: 'monospace' }}>{group.teamLead.uniqueId}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginTop: '2px' }}>
                                                        Team Lead · {group.members.length} members
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#C4956A', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                                                    {fmt(group.teamLead.teamBonus)}
                                                </span>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#C4956A', transform: expandedTeams[group.teamLead.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                            </div>
                                        </button>
                                        {expandedTeams[group.teamLead.id] && group.members.length > 0 && (
                                            <div style={{ borderTop: '1px solid var(--admin-border)', overflowX: 'auto' }}>
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            {['Member', 'ID', 'Self Reward', 'Direct Bonus', 'Team Bonus', 'Business'].map(h => (
                                                                <th key={h}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {group.members.map((m: any) => (
                                                            <tr key={m.id}>
                                                                <td style={{ color: '#F5F0EB' }}>{m.name}</td>
                                                                <td style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '0.75rem' }}>{m.uniqueId}</td>
                                                                <td>{fmt(m.selfReward)}</td>
                                                                <td>{fmt(m.directBonus)}</td>
                                                                <td>{fmt(m.teamBonus)}</td>
                                                                <td>{fmt(m.totalBusiness)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* User Income */}
                    {tab === 'userIncome' && (
                        userIncomeData.length === 0 ? emptyState('No user income records yet.') : (
                            <div className="glass-card" style={{ overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                {['User', 'ID', 'Self Reward', 'Direct Bonus', 'Team Bonus', 'Total Income', 'Business'].map(h => (
                                                    <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userIncomeData.map((u: any) => (
                                                <tr key={u.id}>
                                                    <td style={{ color: '#F5F0EB', fontWeight: 500 }}>{u.name}</td>
                                                    <td style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '0.75rem' }}>{u.uniqueId}</td>
                                                    <td>{fmt(u.selfReward)}</td>
                                                    <td>{fmt(u.directBonus)}</td>
                                                    <td>{fmt(u.teamBonus)}</td>
                                                    <td><span style={{ color: '#10b981', fontWeight: 700 }}>{fmt(u.totalIncome)}</span></td>
                                                    <td style={{ color: '#7A7A8A' }}>{fmt(u.totalBusiness)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
