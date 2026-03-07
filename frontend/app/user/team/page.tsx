'use client';

import { useEffect, useState } from 'react';
import { getMyTeam } from '../lib/api';
import useSWR from 'swr';
import { useSocket } from '../../../lib/SocketContext';

interface TeamNode {
    id: string; name: string; email: string; phone: string; uniqueId: string;
    selfInvestment: number; totalBusiness: number; rank: number;
    status: string; createdAt: string; level: number; downlineCount: number;
    children: TeamNode[];
}

const levelColors: Record<number, string> = { 1: '#60A5FA', 2: '#7C3AED', 3: '#F472B6', 4: '#34D399', 5: '#FBBF24' };
const getColor = (l: number) => levelColors[l] || '#8A8A96';

function MemberCard({ node, expanded, toggleExpand }: { node: TeamNode; expanded: Record<string, boolean>; toggleExpand: (id: string) => void }) {
    const color = getColor(node.level);
    const isOpen = expanded[node.id];
    const hasChildren = node.children.length > 0;
    const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div>
            <div className="card" style={{ borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--border-color)', borderLeft: `3px solid ${color}`, transition: 'all 0.3s' }}>
                {/* Top: Avatar + Name + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 700, color, fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                            {node.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{node.name}</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-copper)' }}>{node.uniqueId}</div>
                        </div>
                    </div>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 500, background: node.status === 'ACTIVE' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)', color: node.status === 'ACTIVE' ? '#34D399' : '#FBBF24' }}>{node.status}</span>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Investment</span><br /><span style={{ fontWeight: 600, color: '#34D399' }}>{fmt(node.selfInvestment)}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Business</span><br /><span style={{ fontWeight: 600, color: '#60A5FA' }}>{fmt(node.totalBusiness)}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Rank</span><br /><span style={{ fontWeight: 600, color: 'var(--accent-copper)' }}>{node.rank || '—'}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Downline</span><br /><span style={{ fontWeight: 600, color: '#7C3AED' }}>{node.downlineCount}</span></div>
                </div>

                {/* Footer: email + date */}
                <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <span>{node.email}</span>
                    <span>{formatDate(node.createdAt)}</span>
                </div>

                {/* Expand children button */}
                {hasChildren && (
                    <button onClick={() => toggleExpand(node.id)} style={{
                        width: '100%', marginTop: '0.6rem', padding: '0.4rem', borderRadius: '6px',
                        background: isOpen ? `${color}10` : 'transparent',
                        border: `1px dashed ${color}40`, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        fontSize: '0.7rem', fontWeight: 500, color, transition: 'all 0.2s',
                        fontFamily: 'var(--font-inter), sans-serif',
                    }}>
                        <span style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>
                        {isOpen ? 'Hide' : 'Show'} {node.downlineCount} team member{node.downlineCount > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Nested children */}
            {hasChildren && isOpen && (
                <div style={{ marginLeft: '1.25rem', borderLeft: `2px solid ${getColor(node.level + 1)}30`, paddingLeft: '1rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem', paddingTop: '0.5rem' }}>
                        {node.children.map(child => (
                            <MemberCard key={child.id} node={child} expanded={expanded} toggleExpand={toggleExpand} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MyTeamPage() {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const { socket } = useSocket();

    const fetchTeam = async () => {
        const res = await getMyTeam();

        // Auto-expand first level on fetch
        const autoExpand: Record<string, boolean> = {};
        (res.data || []).forEach((n: TeamNode) => { if (n.children.length > 0) autoExpand[n.id] = true; });
        setExpanded(prev => ({ ...autoExpand, ...prev }));

        return res;
    };

    const { data, isLoading: loading, mutate: loadTeam } = useSWR('user_team', fetchTeam);
    const tree = data?.data || [];
    const total = data?.total || 0;
    const referredBy = data?.referredBy || null;

    useEffect(() => {
        socket.on('investment:updated', loadTeam);
        return () => { socket.off('investment:updated', loadTeam); };
    }, [socket, loadTeam]);

    const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}><div className="skeleton" style={{ width: '200px', height: '16px' }} /></div>;

    return (
        <div>
            {/* Referred By Card */}
            <div className="card" style={{ borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div className="section-label" style={{ fontSize: '0.65rem' }}>YOUR REFERRER</div>
                {referredBy ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-copper-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-copper)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                            {referredBy.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>{referredBy.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-copper)', fontFamily: 'monospace' }}>{referredBy.uniqueId}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{referredBy.email}</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                        No referrer — you signed up directly
                    </div>
                )}
            </div>

            {/* Header */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div className="section-label" style={{ fontSize: '0.65rem' }}>Team Tree</div>
                <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>
                    My Team <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>({total} member{total !== 1 ? 's' : ''})</span>
                </h2>
            </div>

            {tree.length === 0 ? (
                <div className="card" style={{ borderRadius: '10px', padding: '3rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-inter), sans-serif' }}>No team members yet. Share your referral link to build your team!</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
                    {tree.map((node: TeamNode) => (
                        <MemberCard key={node.id} node={node} expanded={expanded} toggleExpand={toggleExpand} />
                    ))}
                </div>
            )}
        </div>
    );
}
