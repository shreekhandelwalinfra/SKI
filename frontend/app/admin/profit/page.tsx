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

    // Real-time: refresh when investments change
    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
        socket.on('investment:updated', loadData);
        return () => { socket.disconnect(); };
    }, [tab]);

    const toggleTeam = (id: string) => {
        setExpandedTeams(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    const tabs: { key: Tab; label: string }[] = [
        { key: 'firm', label: 'Firm Profit' },
        { key: 'teamBonus', label: 'Team Bonus' },
        { key: 'userIncome', label: 'User Income' },
    ];

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className="px-4 py-2 rounded text-xs uppercase tracking-widest font-medium transition-all"
                        style={{
                            background: tab === t.key ? '#C4956A' : '#22222E',
                            color: tab === t.key ? '#FFF' : '#8A8A96',
                            border: `1px solid ${tab === t.key ? '#C4956A' : '#333340'}`,
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12" style={{ color: '#8A8A96' }}>Loading...</div>
            ) : (
                <>
                    {/* Firm Profit Tab */}
                    {tab === 'firm' && (
                        firmProfits.length === 0 ? (
                            <div className="text-center py-12 rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E', color: '#8A8A96' }}>
                                No firm profit records yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #2E2E3E' }}>
                                            {['S.No', 'User', 'Amount', 'Description', 'Date'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A96' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {firmProfits.map((p, i) => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #22222E' }}>
                                                <td className="px-4 py-3" style={{ color: '#8A8A96' }}>{i + 1}</td>
                                                <td className="px-4 py-3" style={{ color: '#F5F0EB' }}>{p.user?.name || '—'}</td>
                                                <td className="px-4 py-3 font-medium" style={{ color: '#22c55e' }}>{fmt(p.amount)}</td>
                                                <td className="px-4 py-3" style={{ color: '#C0B8AE' }}>{p.description || '—'}</td>
                                                <td className="px-4 py-3" style={{ color: '#8A8A96', fontSize: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {/* Team Bonus Tab */}
                    {tab === 'teamBonus' && (
                        teamBonusData.length === 0 ? (
                            <div className="text-center py-12 rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E', color: '#8A8A96' }}>
                                No team bonus records yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {teamBonusData.map(group => (
                                    <div key={group.teamLead.id} className="rounded-lg overflow-hidden" style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}>
                                        {/* Team Lead Header */}
                                        <button
                                            onClick={() => toggleTeam(group.teamLead.id)}
                                            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                                            style={{ background: expandedTeams[group.teamLead.id] ? 'rgba(196,149,106,0.08)' : 'transparent' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span style={{ color: '#C4956A' }}>
                                                    {expandedTeams[group.teamLead.id] ? '▼' : '▶'}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: '#F5F0EB' }}>
                                                        {group.teamLead.name}
                                                        <span className="ml-2 text-xs" style={{ color: '#C4956A', fontFamily: 'monospace' }}>{group.teamLead.uniqueId}</span>
                                                    </div>
                                                    <div className="text-xs" style={{ color: '#8A8A96' }}>
                                                        Team Lead • {group.members.length} members
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold" style={{ color: '#C4956A' }}>
                                                {fmt(group.teamLead.teamBonus)}
                                            </div>
                                        </button>

                                        {/* Team Members */}
                                        {expandedTeams[group.teamLead.id] && group.members.length > 0 && (
                                            <div style={{ borderTop: '1px solid #2E2E3E' }}>
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid #22222E' }}>
                                                            {['Member', 'ID', 'Self Reward', 'Direct Bonus', 'Team Bonus', 'Business'].map(h => (
                                                                <th key={h} className="text-left px-4 py-2 text-[11px] uppercase tracking-wider" style={{ color: '#8A8A96' }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {group.members.map((m: any) => (
                                                            <tr key={m.id} style={{ borderBottom: '1px solid #1A1A24' }}>
                                                                <td className="px-4 py-2" style={{ color: '#C0B8AE' }}>{m.name}</td>
                                                                <td className="px-4 py-2" style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '11px' }}>{m.uniqueId}</td>
                                                                <td className="px-4 py-2" style={{ color: '#C0B8AE' }}>{fmt(m.selfReward)}</td>
                                                                <td className="px-4 py-2" style={{ color: '#C0B8AE' }}>{fmt(m.directBonus)}</td>
                                                                <td className="px-4 py-2" style={{ color: '#C0B8AE' }}>{fmt(m.teamBonus)}</td>
                                                                <td className="px-4 py-2" style={{ color: '#C0B8AE' }}>{fmt(m.totalBusiness)}</td>
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

                    {/* User Income Tab */}
                    {tab === 'userIncome' && (
                        userIncomeData.length === 0 ? (
                            <div className="text-center py-12 rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E', color: '#8A8A96' }}>
                                No user income records yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #2E2E3E' }}>
                                            {['User', 'ID', 'Self Reward', 'Direct Bonus', 'Team Bonus', 'Total Income', 'Business'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider whitespace-nowrap" style={{ color: '#8A8A96' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userIncomeData.map((u: any) => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid #22222E' }}>
                                                <td className="px-4 py-3" style={{ color: '#F5F0EB' }}>{u.name}</td>
                                                <td className="px-4 py-3" style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '12px' }}>{u.uniqueId}</td>
                                                <td className="px-4 py-3" style={{ color: '#C0B8AE' }}>{fmt(u.selfReward)}</td>
                                                <td className="px-4 py-3" style={{ color: '#C0B8AE' }}>{fmt(u.directBonus)}</td>
                                                <td className="px-4 py-3" style={{ color: '#C0B8AE' }}>{fmt(u.teamBonus)}</td>
                                                <td className="px-4 py-3 font-bold" style={{ color: '#22c55e' }}>{fmt(u.totalIncome)}</td>
                                                <td className="px-4 py-3" style={{ color: '#8A8A96' }}>{fmt(u.totalBusiness)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
