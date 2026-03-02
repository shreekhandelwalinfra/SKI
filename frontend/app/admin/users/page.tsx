'use client';

import { useState, useEffect } from 'react';
import { getUsers, blockUser, deleteUser, getAdminUserTree, updateUserBalances } from '../lib/api';

interface UserItem {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    phone: string;
    uniqueId: string;
    status: string;
    isBlocked: boolean;
    selfReward: number;
    directBonus: number;
    teamBonus: number;
    totalBusiness: number;
    selfInvestment?: number;
    createdAt: string;
}

const TreeNode = ({ n, level = 0, onEdit, onBlock, onDelete }: { n: any, level?: number, onEdit: (u: any) => void, onBlock: (id: string) => void, onDelete: (id: string) => void }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = n.children && n.children.length > 0;
    const fmtTree = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v || 0).toLocaleString('en-IN')}`;
    const isActive = n.status === 'active' || n.status === 'ACTIVE';

    return (
        <div style={{ position: 'relative', zIndex: 1, marginTop: level === 0 ? 0 : '1rem' }}>
            {/* Connector line from parent */}
            {level > 0 && <div style={{ position: 'absolute', left: '-1.25rem', top: '24px', width: '1.25rem', height: '2px', background: 'rgba(196,149,106,0.3)', zIndex: 0 }} />}

            <div style={{
                background: 'linear-gradient(135deg, rgba(15,19,24,0.95), rgba(20,25,32,0.9))',
                borderRadius: '14px', overflow: 'hidden',
                border: '1px solid rgba(196,149,106,0.1)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(196,149,106,0.3)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(196,149,106,0.1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
            >
                {/* Top colored accent */}
                <div style={{ height: '2px', background: isActive ? 'linear-gradient(90deg, #22c55e, rgba(34,197,94,0.1))' : 'linear-gradient(90deg, #f59e0b, rgba(245,158,11,0.1))' }} />

                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {/* Header Row: Avatar + Info + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                            {/* Expand toggle + Avatar combo */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #C4956A, #A67B54)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif',
                                    fontWeight: 700, fontSize: '0.95rem',
                                    boxShadow: '0 3px 10px rgba(196,149,106,0.35)',
                                }}>{n.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                {hasChildren && (
                                    <button onClick={() => setExpanded(!expanded)} style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        background: '#1a1a24', border: '1.5px solid #C4956A',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', padding: 0, color: '#C4956A', fontSize: '8px',
                                        transition: 'transform 0.2s',
                                    }}>
                                        <span style={{ display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▶</span>
                                    </button>
                                )}
                            </div>

                            {/* Name + ID + Status */}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.01em' }}>{n.name}</span>
                                    <span style={{
                                        fontSize: '0.55rem', padding: '2px 8px', borderRadius: '10px',
                                        background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                                        color: isActive ? '#4ade80' : '#fbbf24',
                                        border: `1px solid ${isActive ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                        textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
                                    }}>{n.status}</span>
                                </div>
                                <div style={{
                                    fontFamily: 'monospace', fontSize: '0.72rem', color: '#C4956A',
                                    marginTop: '3px',
                                }}>{n.uniqueId}</div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button
                                onClick={() => onEdit({ _id: n.id, name: n.name, uniqueId: n.uniqueId, email: n.email || '', phone: n.phone || '', status: n.status, isBlocked: n.isBlocked, selfReward: n.selfReward || 0, directBonus: n.directBonus || 0, teamBonus: n.teamBonus || 0, totalBusiness: n.totalBusiness || 0, selfInvestment: n.selfInvestment || 0, createdAt: n.createdAt })}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(250,204,21,0.2)', background: 'rgba(250,204,21,0.08)', color: '#facc15', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(250,204,21,0.18)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(250,204,21,0.08)'; e.currentTarget.style.transform = 'none'; }}
                                title="Edit"
                            ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                            <button
                                onClick={() => onBlock(n.id)}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${n.isBlocked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, background: n.isBlocked ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: n.isBlocked ? '#4ade80' : '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = n.isBlocked ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = n.isBlocked ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'none'; }}
                                title={n.isBlocked ? "Unblock" : "Block"}
                            >{n.isBlocked ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>}</button>
                            <button
                                onClick={() => onDelete(n.id)}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.transform = 'none'; }}
                                title="Delete"
                            ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
                        </div>
                    </div>

                    {/* Stats — 3-column mini cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                        {[
                            { label: 'Rank', value: n.rank > 0 ? `Level ${n.rank}` : '—', color: '#d8b4fe', accent: 'rgba(168,85,247,0.15)' },
                            { label: 'Investment', value: fmtTree(n.selfInvestment), color: '#6ee7b7', accent: 'rgba(52,211,153,0.1)' },
                            { label: 'Volume', value: fmtTree(n.totalBusiness), color: '#93c5fd', accent: 'rgba(96,165,250,0.1)' },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: s.accent, padding: '0.6rem 0.75rem', borderRadius: '8px',
                                borderLeft: `2px solid ${s.color}`,
                            }}>
                                <div style={{ fontSize: '0.5rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px', fontFamily: 'var(--font-inter), sans-serif' }}>{s.label}</div>
                                <div style={{ color: s.color, fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Expand children indicator */}
                    {hasChildren && (
                        <button onClick={() => setExpanded(!expanded)} style={{
                            width: '100%', marginTop: '0.75rem', padding: '0.35rem',
                            borderRadius: '8px', background: expanded ? 'rgba(196,149,106,0.06)' : 'transparent',
                            border: '1px dashed rgba(196,149,106,0.15)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            fontSize: '0.65rem', fontWeight: 500, color: '#C4956A',
                            fontFamily: 'var(--font-inter), sans-serif', transition: 'all 0.2s',
                        }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(196,149,106,0.1)'}
                            onMouseOut={e => e.currentTarget.style.background = expanded ? 'rgba(196,149,106,0.06)' : 'transparent'}
                        >
                            {expanded ? '▾ Hide' : '▸ Show'} {n.children.length} member{n.children.length > 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div style={{ paddingLeft: '2rem', position: 'relative', marginTop: '0.5rem' }}>
                    <div style={{ position: 'absolute', left: '0.75rem', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, rgba(196,149,106,0.4), rgba(196,149,106,0.05))', zIndex: 0 }} />
                    {n.children.map((child: any) => <TreeNode key={child.id} n={child} level={level + 1} onEdit={onEdit} onBlock={onBlock} onDelete={onDelete} />)}
                </div>
            )}
        </div>
    );
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'blocked'>('all');

    // Tree Modal
    const [treeUser, setTreeUser] = useState<UserItem | null>(null);
    const [treeData, setTreeData] = useState<any[] | null>(null);
    const [treeLoading, setTreeLoading] = useState(false);

    // Edit Balances Modal
    const [editUser, setEditUser] = useState<UserItem | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [editSaving, setEditSaving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [filter, search]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            let params = '';
            if (filter === 'blocked') params += 'status=blocked';
            if (search) params += `${params ? '&' : ''}search=${encodeURIComponent(search)}`;
            const res = await getUsers(params || undefined);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (id: string) => {
        try {
            await blockUser(id);
            loadUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await deleteUser(id);
            loadUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleViewTree = async (user: UserItem) => {
        setTreeUser(user);
        setTreeData(null);
        setTreeLoading(true);
        try {
            const userId = user.id || user._id;
            if (!userId) return;
            const res = await getAdminUserTree(userId);
            setTreeData(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to load tree');
        } finally {
            setTreeLoading(false);
        }
    };

    const openEditModal = (user: UserItem) => {
        setEditUser(user);
        setEditForm({
            selfReward: user.selfReward || 0,
            directBonus: user.directBonus || 0,
            teamBonus: user.teamBonus || 0,
            totalBusiness: user.totalBusiness || 0,
            selfInvestment: user.selfInvestment || 0,
        });
    };

    const handleEditSave = async () => {
        if (!editUser) return;
        setEditSaving(true);
        try {
            await updateUserBalances((editUser.id || editUser._id) as string, {
                selfReward: Number(editForm.selfReward),
                directBonus: Number(editForm.directBonus),
                teamBonus: Number(editForm.teamBonus),
                totalBusiness: Number(editForm.totalBusiness),
                selfInvestment: Number(editForm.selfInvestment),
            });
            setEditUser(null);
            loadUsers();

            if (treeUser) {
                const res = await getAdminUserTree((treeUser.id || treeUser._id) as string);
                setTreeData(res.data);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update balances');
        } finally {
            setEditSaving(false);
        }
    };

    const handleBlockedFromTree = async (id: string) => {
        await handleBlock(id);
        if (treeUser) {
            const res = await getAdminUserTree((treeUser.id || treeUser._id) as string);
            setTreeData(res.data);
        }
    };

    const handleDeletedFromTree = async (id: string) => {
        await handleDelete(id);
        if (treeUser) {
            const res = await getAdminUserTree((treeUser.id || treeUser._id) as string);
            setTreeData(res.data);
        }
    };

    const renderTreeNodes = (nodes: any[]) => {
        if (!nodes || nodes.length === 0) return null;
        return (
            <div style={{ paddingLeft: '2.5rem', position: 'relative', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ position: 'absolute', left: '1rem', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, #C4956A 0%, rgba(196,149,106,0.1) 100%)', zIndex: 0 }} />
                {nodes.map((n: any) => (
                    <TreeNode key={n.id} n={n} level={0} onEdit={openEditModal} onBlock={handleBlockedFromTree} onDelete={handleDeletedFromTree} />
                ))}
            </div>
        );
    };

    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;
    const statusColor = (s: string) => {
        const sl = s?.toLowerCase();
        if (sl === 'active') return { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)', bar: '#22c55e' };
        if (sl === 'blocked') return { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.25)', bar: '#ef4444' };
        return { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)', bar: '#f59e0b' };
    };

    return (
        <div className="pb-10">
            {/* Page Header + Controls — wrapped in a card */}
            <div style={{
                background: 'linear-gradient(160deg, rgba(20,25,32,0.95), rgba(15,19,24,0.9))',
                borderRadius: '16px', overflow: 'hidden',
                border: '1px solid rgba(196,149,106,0.1)',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}>
                {/* Copper accent line */}
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574, rgba(196,149,106,0.05))' }} />

                <div style={{ padding: '1.5rem 1.75rem' }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.55rem', color: '#C4956A', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, marginBottom: '4px' }}>Network</div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.03em', margin: 0 }}>User Management</h1>
                        </div>
                        {!loading && (
                            <span style={{
                                fontSize: '0.68rem', padding: '5px 14px', borderRadius: '20px',
                                background: 'rgba(196,149,106,0.08)', color: '#C4956A',
                                border: '1px solid rgba(196,149,106,0.18)',
                                fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600,
                            }}>{users.length} user{users.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#8A8A96', fontFamily: 'var(--font-inter), sans-serif', margin: 0, marginBottom: '1.25rem' }}>Manage your real-estate network downline.</p>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(196,149,106,0.12), transparent)', marginBottom: '1.25rem' }} />

                    {/* Search + Filter row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '360px' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            </div>
                            <input type="text" placeholder="Search by name, email, or ID..." value={search} onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '10px',
                                    background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(196,149,106,0.12)',
                                    color: '#F5F0EB', fontSize: '0.82rem', outline: 'none', transition: 'all 0.2s',
                                    fontFamily: 'var(--font-inter), sans-serif',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,149,106,0.1)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(196,149,106,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Filter tabs */}
                        <div style={{ display: 'flex', gap: '4px', padding: '3px', borderRadius: '10px', background: 'rgba(10,10,15,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            {(['all', 'blocked'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    padding: '0.45rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                                    fontFamily: 'var(--font-inter), sans-serif', transition: 'all 0.2s',
                                    background: filter === f ? 'linear-gradient(135deg, #C4956A, #A67B54)' : 'transparent',
                                    color: filter === f ? '#fff' : '#8A8A96',
                                    boxShadow: filter === f ? '0 3px 10px rgba(196,149,106,0.25)' : 'none',
                                }}>{f === 'all' ? 'All Users' : 'Blocked'}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-full border-2 border-[#C4956A] border-t-transparent animate-spin mb-4" />
                    <div style={{ color: '#8A8A96', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Synching Network Data...</div>
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <svg className="mb-4 opacity-50" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <div style={{ color: '#8A8A96', fontSize: '1.1rem' }}>No network records found.</div>
                    <div style={{ color: '#666675', fontSize: '0.85rem', marginTop: '0.5rem' }}>Try adjusting your search or filters.</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '1rem' }}>
                    {users.map(user => {
                        const sc = statusColor(user.status);
                        const uid = (user.id || user._id) as string;
                        return (
                            <div key={uid} style={{
                                background: 'rgba(15,19,24,0.9)', borderRadius: '16px', overflow: 'hidden',
                                border: '1px solid rgba(196,149,106,0.08)', transition: 'all 0.3s ease',
                                position: 'relative',
                            }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(196,149,106,0.25)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(196,149,106,0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                            >
                                {/* Status accent bar (top) */}
                                <div style={{ height: '3px', background: `linear-gradient(90deg, ${sc.bar}, transparent)` }} />

                                {/* Card body */}
                                <div style={{ padding: '1.25rem 1.5rem' }}>
                                    {/* Header: Avatar + Name + Status */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                            <div style={{
                                                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                                                background: 'linear-gradient(135deg, #C4956A, #A67B54)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif',
                                                fontWeight: 700, fontSize: '1rem',
                                                boxShadow: '0 4px 12px rgba(196,149,106,0.3)',
                                            }}>{user.name.charAt(0).toUpperCase()}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#8A8A96', fontFamily: 'var(--font-inter), sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.6rem', padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
                                            background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                                            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
                                        }}>{user.status}</span>
                                    </div>

                                    {/* Unique ID chip */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <span style={{
                                            fontFamily: 'monospace', fontSize: '0.78rem', color: '#C4956A',
                                            background: 'rgba(196,149,106,0.06)', padding: '5px 10px', borderRadius: '6px',
                                            border: '1px solid rgba(196,149,106,0.12)', display: 'inline-block',
                                        }}>{user.uniqueId}</span>
                                    </div>

                                    {/* Stats strip */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <div style={{ background: 'rgba(26,42,74,0.35)', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ fontSize: '0.55rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px', fontFamily: 'var(--font-inter), sans-serif' }}>Investment</div>
                                            <div style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-inter), sans-serif' }}>{fmt(user.selfInvestment || 0)}</div>
                                        </div>
                                        <div style={{ background: 'rgba(26,42,74,0.35)', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ fontSize: '0.55rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px', fontFamily: 'var(--font-inter), sans-serif' }}>Volume</div>
                                            <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-inter), sans-serif' }}>{fmt(user.totalBusiness)}</div>
                                        </div>
                                        <div style={{ background: 'rgba(26,42,74,0.35)', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ fontSize: '0.55rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px', fontFamily: 'var(--font-inter), sans-serif' }}>Joined</div>
                                            <div style={{ color: '#C0B8AE', fontWeight: 500, fontSize: '0.8rem', fontFamily: 'var(--font-inter), sans-serif' }}>{new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action bar (bottom) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                    {/* View Tree */}
                                    <button onClick={() => handleViewTree(user)} style={{
                                        padding: '0.7rem 0', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                        background: 'transparent', color: '#38bdf8', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                                        fontFamily: 'var(--font-inter), sans-serif', transition: 'background 0.2s',
                                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(56,189,248,0.06)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        Tree
                                    </button>
                                    {/* Edit */}
                                    <button onClick={() => openEditModal(user)} style={{
                                        padding: '0.7rem 0', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                        background: 'transparent', color: '#facc15', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                                        fontFamily: 'var(--font-inter), sans-serif', transition: 'background 0.2s',
                                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(250,204,21,0.06)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        Edit
                                    </button>
                                    {/* Block/Unblock */}
                                    <button onClick={() => handleBlock(uid)} style={{
                                        padding: '0.7rem 0', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                        background: 'transparent', color: user.isBlocked ? '#4ade80' : '#f87171', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                                        fontFamily: 'var(--font-inter), sans-serif', transition: 'background 0.2s',
                                    }} onMouseOver={e => e.currentTarget.style.background = user.isBlocked ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        {user.isBlocked ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                                        )}
                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                    {/* Delete */}
                                    <button onClick={() => handleDelete(uid)} style={{
                                        padding: '0.7rem 0', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                        background: 'transparent', color: '#ef4444', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                                        fontFamily: 'var(--font-inter), sans-serif', transition: 'background 0.2s',
                                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tree Modal */}
            {treeUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,5,10,0.88)', backdropFilter: 'blur(16px)' }}>
                    <div style={{
                        width: '100%', maxWidth: '740px', maxHeight: '90vh', borderRadius: '18px', overflow: 'hidden',
                        background: 'linear-gradient(160deg, rgba(20,25,32,0.98), rgba(15,19,24,0.98))',
                        border: '1px solid rgba(196,149,106,0.12)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(196,149,106,0.04)',
                        display: 'flex', flexDirection: 'column' as const,
                    }}>
                        {/* Copper accent line */}
                        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574, rgba(196,149,106,0.1))' }} />

                        {/* Header */}
                        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #C4956A, #A67B54)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif',
                                        fontWeight: 700, fontSize: '1rem',
                                        boxShadow: '0 3px 10px rgba(196,149,106,0.35)',
                                    }}>{treeUser.name?.charAt(0)?.toUpperCase()}</div>
                                    <div>
                                        <h2 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.02em' }}>Network Tree</h2>
                                        <div style={{ fontSize: '0.72rem', color: '#C4956A', fontFamily: 'monospace', marginTop: '1px' }}>{treeUser.name} · {treeUser.uniqueId}</div>
                                    </div>
                                </div>
                                <button onClick={() => setTreeUser(null)} style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: '#8A8A96', transition: 'all 0.2s',
                                }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8A8A96'; }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Tree content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem 2rem' }} className="custom-scrollbar">
                            {treeLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#C4956A] border-t-transparent animate-spin" />
                                    <div style={{ color: '#8A8A96', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem', fontFamily: 'var(--font-inter), sans-serif' }}>Loading tree...</div>
                                </div>
                            ) : treeData !== null ? (
                                <TreeNode
                                    n={{ ...treeUser, id: treeUser._id, children: treeData || [] }}
                                    level={0}
                                    onEdit={openEditModal}
                                    onBlock={handleBlockedFromTree}
                                    onDelete={handleDeletedFromTree}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '5rem 0', borderRadius: '12px', border: '1px dashed rgba(196,149,106,0.15)' }}>
                                    <div style={{ color: '#8A8A96', fontSize: '1rem' }}>No tree data available.</div>
                                    <div style={{ color: '#666675', fontSize: '0.8rem', marginTop: '0.4rem' }}>Could not retrieve network structure.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Balances Modal */}
            {editUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(5,5,10,0.88)', backdropFilter: 'blur(16px)' }}>
                    <div style={{
                        width: '100%', maxWidth: '460px', borderRadius: '18px', overflow: 'hidden',
                        background: 'linear-gradient(160deg, rgba(20,25,32,0.98), rgba(15,19,24,0.98))',
                        border: '1px solid rgba(196,149,106,0.12)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(196,149,106,0.04)',
                    }}>
                        {/* Copper accent line */}
                        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574, rgba(196,149,106,0.1))' }} />

                        {/* Header with avatar */}
                        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #C4956A, #A67B54)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif',
                                        fontWeight: 700, fontSize: '0.9rem',
                                        boxShadow: '0 3px 10px rgba(196,149,106,0.3)',
                                    }}>{editUser.name?.charAt(0)?.toUpperCase()}</div>
                                    <div>
                                        <h2 style={{ color: '#F5F0EB', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.02em' }}>Edit Balances</h2>
                                        <div style={{ fontSize: '0.72rem', color: '#C4956A', fontFamily: 'monospace', marginTop: '1px' }}>{editUser.name} · {editUser.uniqueId}</div>
                                    </div>
                                </div>
                                <button onClick={() => setEditUser(null)} style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: '#8A8A96', transition: 'all 0.2s',
                                }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8A8A96'; }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Form body */}
                        <div style={{ padding: '1.25rem 1.75rem 1.5rem' }}>
                            {/* Bonus fields group */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.55rem', color: '#C4956A', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'var(--font-inter), sans-serif' }}>Bonus Earnings</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[
                                        { key: 'selfReward', label: 'Self Reward', color: '#FBBF24' },
                                        { key: 'directBonus', label: 'Direct Bonus', color: '#F472B6' },
                                    ].map(f => (
                                        <div key={f.key} style={{ borderLeft: `2px solid ${f.color}`, paddingLeft: '0.75rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.58rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>{f.label} (₹)</label>
                                            <input type="number" value={(editForm as any)[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.06)', color: '#F5F0EB', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-inter), sans-serif' }}
                                                onFocus={e => e.target.style.borderColor = f.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ borderLeft: '2px solid #34D399', paddingLeft: '0.75rem', marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.58rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>Team Bonus (₹)</label>
                                    <input type="number" value={editForm.teamBonus} onChange={e => setEditForm({ ...editForm, teamBonus: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.06)', color: '#F5F0EB', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-inter), sans-serif' }}
                                        onFocus={e => e.target.style.borderColor = '#34D399'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(196,149,106,0.15), transparent)' }} />
                                <span style={{ fontSize: '0.5rem', color: '#C4956A', textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600 }}>Rank Drivers</span>
                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(196,149,106,0.15), transparent)' }} />
                            </div>

                            {/* Rank driver fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[
                                    { key: 'selfInvestment', label: 'Self Investment', color: '#34d399', hint: 'Rank calc' },
                                    { key: 'totalBusiness', label: 'Team Volume', color: '#60a5fa', hint: 'Rank calc' },
                                ].map(f => (
                                    <div key={f.key} style={{ borderLeft: `2px solid ${f.color}`, paddingLeft: '0.75rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.58rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>
                                            <span>{f.label} (₹)</span>
                                            <span style={{ color: f.color, fontSize: '0.5rem', fontWeight: 600 }}>{f.hint}</span>
                                        </label>
                                        <input type="number" value={(editForm as any)[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', background: 'rgba(10,10,15,0.6)', border: `1px solid ${f.color}20`, color: '#F5F0EB', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-inter), sans-serif' }}
                                            onFocus={e => e.target.style.borderColor = f.color} onBlur={e => e.target.style.borderColor = `${f.color}20`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setEditUser(null)} style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
                                    background: 'rgba(255,255,255,0.03)', color: '#8A8A96', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-inter), sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#C0B8AE'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#8A8A96'; }}
                                >Discard</button>
                                <button onClick={handleEditSave} disabled={editSaving} style={{
                                    flex: 2, padding: '0.75rem', borderRadius: '12px', border: 'none',
                                    background: 'linear-gradient(135deg, #C4956A, #A67B54)',
                                    color: '#fff', cursor: editSaving ? 'not-allowed' : 'pointer',
                                    fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-inter), sans-serif',
                                    opacity: editSaving ? 0.6 : 1,
                                    boxShadow: '0 4px 18px rgba(196,149,106,0.25)',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseOver={e => !editSaving && (e.currentTarget.style.boxShadow = '0 6px 24px rgba(196,149,106,0.4)')}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(196,149,106,0.25)'}
                                >{editSaving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
