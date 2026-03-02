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

    return (
        <div style={{ position: 'relative', zIndex: 1, marginTop: level === 0 ? 0 : '1.5rem' }}>
            {level > 0 && <div style={{ position: 'absolute', left: '-1.5rem', top: '28px', width: '1.5rem', height: '2px', background: '#C4956A', zIndex: 0, opacity: 0.5 }} />}

            <div style={{
                background: 'rgba(34,34,46,0.6)', backdropFilter: 'blur(8px)', padding: '1.25rem',
                borderRadius: '12px', border: '1px solid rgba(196, 149, 106, 0.2)',
                position: 'relative', zIndex: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }} className="hover:-translate-y-1 hover:shadow-2xl hover:border-[#C4956A]">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                        {hasChildren && (
                            <button onClick={() => setExpanded(!expanded)} className="mt-1 w-6 h-6 flex items-center justify-center rounded bg-black/20 border border-white/10 hover:bg-white/10 transition-colors">
                                {expanded ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                )}
                            </button>
                        )}
                        <div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <div style={{ color: '#FFF', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.01em' }}>{n.name}</div>
                                <span style={{
                                    fontSize: '0.65rem', padding: '2px 10px', borderRadius: '20px',
                                    background: n.status === 'active' || n.status === 'ACTIVE' ? 'linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)' : 'linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)',
                                    color: n.status === 'active' || n.status === 'ACTIVE' ? '#4ade80' : '#f87171',
                                    border: `1px solid ${n.status === 'active' || n.status === 'ACTIVE' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>{n.status}</span>
                            </div>
                            <div style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(196,149,106,0.05)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', border: '1px solid rgba(196, 149, 106, 0.1)' }}>{n.uniqueId}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => onEdit({ _id: n.id, name: n.name, uniqueId: n.uniqueId, email: n.email || '', phone: n.phone || '', status: n.status, isBlocked: n.isBlocked, selfReward: n.selfReward || 0, directBonus: n.directBonus || 0, teamBonus: n.teamBonus || 0, totalBusiness: n.totalBusiness || 0, selfInvestment: n.selfInvestment || 0, createdAt: n.createdAt })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                            style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(250,204,21,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(250,204,21,0.1)'; e.currentTarget.style.transform = 'none'; }}
                            title="Edit Details"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                            onClick={() => onBlock(n.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                            style={{ background: n.isBlocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: n.isBlocked ? '#4ade80' : '#f87171', border: `1px solid ${n.isBlocked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}
                            onMouseOver={e => { e.currentTarget.style.background = n.isBlocked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = n.isBlocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'none'; }}
                            title={n.isBlocked ? "Unblock User" : "Block User"}
                        >
                            {n.isBlocked ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                            )}
                        </button>
                        <button
                            onClick={() => onDelete(n.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                            style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.1)' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.transform = 'none'; }}
                            title="Delete User"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div style={{ background: 'rgba(26,26,36,0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Current Rank</div>
                        <div style={{ color: '#d8b4fe', fontWeight: 600, fontSize: '0.95rem' }}>{n.rank > 0 ? `Level ${n.rank}` : '—'}</div>
                    </div>
                    <div style={{ background: 'rgba(26,26,36,0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Investment Base</div>
                        <div style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '0.95rem' }}>₹{n.selfInvestment?.toLocaleString() || 0}</div>
                    </div>
                    <div style={{ background: 'rgba(26,26,36,0.5)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#8A8A96', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Team Volume</div>
                        <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: '0.95rem' }}>₹{n.totalBusiness?.toLocaleString() || 0}</div>
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div style={{ paddingLeft: '2.5rem', position: 'relative', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, #C4956A 0%, rgba(196,149,106,0.1) 100%)', zIndex: 0 }} />
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

    return (
        <div className="pb-10">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#FFF' }}>Network Origin</h1>
                <p className="mt-1" style={{ color: '#8A8A96' }}>Manage your entire real-estate network downline in one place.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all shadow-sm"
                        style={{
                            background: 'rgba(26,26,36,0.6)',
                            border: '1px solid rgba(196,149,106,0.2)',
                            color: '#FFF',
                            backdropFilter: 'blur(10px)'
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196,149,106,0.1)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(196,149,106,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                <div className="flex gap-2 p-1 rounded-xl w-full sm:w-auto overflow-x-auto" style={{ background: 'rgba(26,26,36,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {(['all', 'blocked'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="px-5 py-2 rounded-lg text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap"
                            style={{
                                background: filter === f ? 'linear-gradient(135deg, #C4956A 0%, #A67B54 100%)' : 'transparent',
                                color: filter === f ? '#FFF' : '#8A8A96',
                                boxShadow: filter === f ? '0 4px 10px rgba(196,149,106,0.3)' : 'none'
                            }}
                        >
                            {f === 'all' ? 'All Users' : 'Blocked Users'}
                        </button>
                    ))}
                </div>
            </div>

            {/* User Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-full border-2 border-[#C4956A] border-t-transparent animate-spin mb-4" />
                    <div style={{ color: '#8A8A96', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Synching Network Data...</div>
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <svg className="mb-4 opacity-50" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <div style={{ color: '#8A8A96', fontSize: '1.1rem' }}>No network records found.</div>
                    <div style={{ color: '#666675', fontSize: '0.85rem', marginTop: '0.5rem' }}>Try adjusting your search or filters.</div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl shadow-xl" style={{ background: 'rgba(26,26,36,0.8)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                                    {['User Identity', 'Reference ID', 'Live Status', 'Total Volume', 'Deployment Date', 'Management'].map(h => (
                                        <th key={h} className="text-left px-6 py-4 text-[0.65rem] uppercase tracking-[0.15em] font-medium" style={{ color: '#8A8A96' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <tr key={user.id || user._id} className="transition-colors hover:bg-white/5" style={{ borderBottom: i === users.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: 'linear-gradient(135deg, rgba(196,149,106,0.1), rgba(166,123,84,0.05))', color: '#C4956A', border: '1px solid rgba(196,149,106,0.2)' }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ color: '#FFF', fontWeight: 500, letterSpacing: '0.01em' }}>{user.name}</div>
                                                    <div className="text-[0.7rem] mt-0.5" style={{ color: '#8A8A96' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle" style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            <span style={{ background: 'rgba(196,149,106,0.05)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(196,149,106,0.1)' }}>
                                                {user.uniqueId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span
                                                className="px-3 py-1.5 rounded-full text-[0.65rem] uppercase tracking-wider font-medium"
                                                style={{
                                                    background: user.status === 'active' ? 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)' :
                                                        user.status === 'blocked' ? 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)' : 'rgba(245,158,11,0.15)',
                                                    color: user.status === 'active' ? '#4ade80' :
                                                        user.status === 'blocked' ? '#f87171' : '#fbbf24',
                                                    border: `1px solid ${user.status === 'active' ? 'rgba(34,197,94,0.2)' : user.status === 'blocked' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.3)'}`
                                                }}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle font-medium" style={{ color: '#60A5FA' }}>
                                            ₹{user.totalBusiness.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 align-middle" style={{ color: '#8A8A96', fontSize: '0.85rem' }}>
                                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => handleViewTree(user)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                                    style={{ background: 'linear-gradient(45deg, rgba(56,189,248,0.1), rgba(56,189,248,0.05))', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(45deg, rgba(56,189,248,0.1), rgba(56,189,248,0.05))'; e.currentTarget.style.transform = 'none'; }}
                                                    title="View Network Tree"
                                                >
                                                    Tree View
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                                                    style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(250,204,21,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(250,204,21,0.1)'; e.currentTarget.style.transform = 'none'; }}
                                                    title="Edit User Parameters"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleBlock((user.id || user._id) as string)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                                                    style={{
                                                        background: user.isBlocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                        color: user.isBlocked ? '#4ade80' : '#f87171',
                                                        border: `1px solid ${user.isBlocked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = user.isBlocked ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = user.isBlocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'none'; }}
                                                    title={user.isBlocked ? "Unblock User" : "Block User"}
                                                >
                                                    {user.isBlocked ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete((user.id || user._id) as string)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                                                    style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.1)' }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.transform = 'none'; }}
                                                    title="Delete User"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tree Modal */}
            {treeUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300" style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="w-full max-w-3xl rounded-2xl p-8 flex flex-col relative overflow-hidden" style={{ background: 'rgba(26, 26, 36, 0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxHeight: '90vh' }}>
                        {/* Background subtle glow */}
                        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(196,149,106,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

                        <div className="flex justify-between items-start mb-8 relative z-10 border-b pb-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#FFF' }}>Network Origin Tree</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <div style={{ color: '#C4956A', fontWeight: 500 }}>{treeUser.name}</div>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8A8A96' }} />
                                    <div style={{ color: '#8A8A96', fontFamily: 'monospace', fontSize: '0.85rem' }}>{treeUser.uniqueId}</div>
                                </div>
                            </div>
                            <button onClick={() => setTreeUser(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                            {treeLoading ? (
                                <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="w-8 h-8 rounded-full border-2 border-[#C4956A] border-t-transparent animate-spin" />
                                    <div style={{ color: '#8A8A96', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Compiling network topology...</div>
                                </div>
                            ) : treeData !== null ? (
                                <div style={{ paddingBottom: '2rem' }}>
                                    <TreeNode
                                        n={{ ...treeUser, id: treeUser._id, children: treeData || [] }}
                                        level={0}
                                        onEdit={openEditModal}
                                        onBlock={handleBlockedFromTree}
                                        onDelete={handleDeletedFromTree}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-20 rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <div style={{ color: '#8A8A96', fontSize: '1.1rem' }}>No network tree initialized.</div>
                                    <div style={{ color: '#666675', fontSize: '0.85rem', marginTop: '0.5rem' }}>Failed to retrieve origin structure.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Balances Modal */}
            {editUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300" style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="w-full max-w-md rounded-2xl p-8 relative overflow-hidden shadow-2xl" style={{ background: 'rgba(34, 34, 46, 0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex justify-between items-start mb-6 border-b pb-5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight" style={{ color: '#FFF' }}>Modify Parameters</h2>
                                <p className="text-sm mt-1" style={{ color: '#8A8A96' }}>For <span style={{ color: '#C4956A' }}>{editUser.name}</span></p>
                            </div>
                            <button onClick={() => setEditUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[0.65rem] font-medium uppercase tracking-widest mb-2" style={{ color: '#8A8A96' }}>Self Reward (₹)</label>
                                    <input type="number" value={editForm.selfReward} onChange={e => setEditForm({ ...editForm, selfReward: e.target.value })} className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#FFF', fontSize: '0.95rem' }} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                                </div>
                                <div>
                                    <label className="block text-[0.65rem] font-medium uppercase tracking-widest mb-2" style={{ color: '#8A8A96' }}>Direct Bonus (₹)</label>
                                    <input type="number" value={editForm.directBonus} onChange={e => setEditForm({ ...editForm, directBonus: e.target.value })} className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#FFF', fontSize: '0.95rem' }} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[0.65rem] font-medium uppercase tracking-widest mb-2" style={{ color: '#8A8A96' }}>Team Bonus (₹)</label>
                                <input type="number" value={editForm.teamBonus} onChange={e => setEditForm({ ...editForm, teamBonus: e.target.value })} className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#FFF', fontSize: '0.95rem' }} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                            </div>

                            <div className="py-2 flex items-center gap-4">
                                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                <div className="text-[0.6rem] uppercase tracking-widest text-white/30">System Drivers</div>
                                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                            </div>

                            <div>
                                <label className="block text-[0.65rem] font-medium uppercase tracking-widest mb-2 flex justify-between items-center" style={{ color: '#8A8A96' }}>
                                    <span>Self Investment Base (₹)</span>
                                    <span style={{ color: '#34d399', fontSize: '0.6rem' }}>Used for Rank calc</span>
                                </label>
                                <input type="number" value={editForm.selfInvestment} onChange={e => setEditForm({ ...editForm, selfInvestment: e.target.value })} className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(52,211,153,0.2)', color: '#FFF', fontSize: '0.95rem' }} onFocus={e => e.target.style.borderColor = '#34d399'} onBlur={e => e.target.style.borderColor = 'rgba(52,211,153,0.2)'} />
                            </div>
                            <div>
                                <label className="block text-[0.65rem] font-medium uppercase tracking-widest mb-2 flex justify-between items-center" style={{ color: '#8A8A96' }}>
                                    <span>Team Business Volume (₹)</span>
                                    <span style={{ color: '#60a5fa', fontSize: '0.6rem' }}>Used for Rank calc</span>
                                </label>
                                <input type="number" value={editForm.totalBusiness} onChange={e => setEditForm({ ...editForm, totalBusiness: e.target.value })} className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={{ background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(96,165,250,0.2)', color: '#FFF', fontSize: '0.95rem' }} onFocus={e => e.target.style.borderColor = '#60a5fa'} onBlur={e => e.target.style.borderColor = 'rgba(96,165,250,0.2)'} />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setEditUser(null)} className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: '#8A8A96' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Discard</button>
                            <button onClick={handleEditSave} disabled={editSaving} className="flex-[2] px-4 py-3 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #A67B54 100%)', boxShadow: '0 4px 15px rgba(196,149,106,0.2)' }} onMouseOver={e => !editSaving && (e.currentTarget.style.boxShadow = '0 6px 20px rgba(196,149,106,0.4)')} onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(196,149,106,0.2)'}>
                                {editSaving ? 'Applying Changes...' : 'Enforce Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
