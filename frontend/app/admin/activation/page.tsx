'use client';

import { useState, useEffect } from 'react';
import { getUsers, activateUser, blockUser, addUser } from '../lib/api';
import useSWR, { useSWRConfig } from 'swr';
import { useSocket } from '../../../lib/SocketContext';

interface UserItem {
    id: string;
    name: string;
    email: string;
    phone: string;
    uniqueId: string;
    referralCode?: string;
    status: string;
    isBlocked: boolean;
    rank?: number;
    selfReward?: number;
    directBonus?: number;
    teamBonus?: number;
    totalBusiness?: number;
    selfInvestment?: number;
    createdAt: string;
    activatedAt?: string;
    referredBy?: { name: string; uniqueId: string } | null;
    teamLead?: { name: string; uniqueId: string } | null;
}

export default function ActivationPage() {
    const [statusFilter, setStatusFilter] = useState('pending');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ id: string; action: string; name: string } | null>(null);
    const [updating, setUpdating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [formError, setFormError] = useState('');
    const { socket } = useSocket();

    const fetchUsers = async () => {
        const res = await getUsers(`status=${statusFilter}`);
        return res.data;
    };

    const { data: usersData, isLoading: loading, mutate: loadUsers } = useSWR(
        ['admin_activation', statusFilter],
        fetchUsers
    );
    const users: UserItem[] = usersData || [];

    const { mutate: globalMutate } = useSWRConfig();

    const refreshAllTabs = async () => {
        console.log('[Socket] user:updated received. Aggressively busting all SWR caches...');

        // Aggressively match ANY key that starts with admin_activation and force revalidation
        await globalMutate(
            (key: any) => Array.isArray(key) && key[0] === 'admin_activation',
            undefined, // Do NOT set data, just mark stale
            { revalidate: true } // Force immediate refetch
        );

        // Backup plan: Absolute guarantee that the CURRENTLY VIEWED tab re-fetches its data immediately
        await loadUsers(undefined, { revalidate: true });
    };

    useEffect(() => {
        socket.on('user:updated', refreshAllTabs);
        socket.on('investment:updated', refreshAllTabs); // Investment impacts business amounts
        return () => {
            socket.off('user:updated', refreshAllTabs);
            socket.off('investment:updated', refreshAllTabs);
        };
    }, [socket, globalMutate, loadUsers]);

    const handleConfirm = async () => {
        if (!confirmModal) return;
        setUpdating(true);
        try {
            if (confirmModal.action === 'activate') await activateUser(confirmModal.id);
            else await blockUser(confirmModal.id);
            refreshAllTabs(); // Instantly update all SWR caches, not just the active tab
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
            setConfirmModal(null);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await addUser({ ...formData, status: 'pending' });
            setShowAddModal(false);
            setFormData({ name: '', email: '', phone: '', password: '' });
            refreshAllTabs();
        } catch (err: any) {
            setFormError(err.message);
        }
    };

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
        PENDING: { bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', dot: '#f59e0b' },
        ACTIVE: { bg: 'rgba(34,197,94,0.08)', text: '#22c55e', dot: '#22c55e' },
        BLOCKED: { bg: 'rgba(239,68,68,0.08)', text: '#ef4444', dot: '#ef4444' },
    };

    const filterTabs = [
        { key: 'pending', label: 'Pending' },
        { key: 'active', label: 'Active' },
        { key: 'blocked', label: 'Blocked' },
    ];

    return (
        <div style={{ position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C4956A', fontWeight: 600, marginBottom: '4px' }}>Administration</p>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F5F0EB', margin: 0 }}>User Activation</h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        background: 'linear-gradient(135deg, #C4956A, #a87a50)', color: '#fff', border: 'none',
                        boxShadow: '0 2px 8px rgba(196,149,106,0.3)', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    + Add User
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem', padding: '4px', background: '#15151E', borderRadius: '10px', border: '1px solid #22222E' }}>
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setStatusFilter(tab.key); }}
                        style={{
                            flex: 1, padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 500,
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: statusFilter === tab.key ? '#C4956A' : 'transparent',
                            color: statusFilter === tab.key ? '#FFF' : '#8A8A96',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'linear-gradient(90deg, #1A1A24 25%, #22222E 50%, #1A1A24 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    ))}
                </div>
            ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '14px', background: '#1A1A24', border: '1px solid #22222E' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👤</div>
                    <p style={{ color: '#8A8A96', fontSize: '0.9rem' }}>No {statusFilter} users found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {users.map((user) => {
                        const ss = statusStyles[user.status] || statusStyles.PENDING;
                        const isExpanded = expandedId === user.id;

                        return (
                            <div
                                key={user.id}
                                style={{
                                    borderRadius: '14px', background: '#1A1A24',
                                    border: `1px solid ${isExpanded ? '#333340' : '#22222E'}`,
                                    overflow: 'hidden', transition: 'all 0.2s',
                                }}
                            >
                                {/* Main Row */}
                                <div className="overflow-scroll-x">
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : user.id)}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr) auto auto',
                                            alignItems: 'center', padding: '14px 20px', cursor: 'pointer', gap: '16px',
                                            minWidth: '600px',
                                        }}
                                    >
                                        {/* User */}
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#F5F0EB', fontSize: '0.85rem' }}>{user.name}</div>
                                            <div style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '0.7rem', marginTop: '2px' }}>{user.uniqueId}</div>
                                        </div>

                                        {/* Email */}
                                        <div style={{ color: '#8A8A96', fontSize: '0.78rem' }}>{user.email}</div>

                                        {/* Phone */}
                                        <div style={{ color: '#C0B8AE', fontSize: '0.82rem' }}>{user.phone || '—'}</div>

                                        {/* Date */}
                                        <div style={{ color: '#555', fontSize: '0.72rem' }}>{fmtDate(user.createdAt)}</div>

                                        {/* Status */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ss.dot }} />
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: ss.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.status}</span>
                                            <span style={{ color: '#555', fontSize: '0.85rem', marginLeft: '4px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #22222E', padding: '20px', background: '#12121C' }}>

                                        {/* ── Section: Contact Info ── */}
                                        <div style={{ fontSize: '0.52rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '8px' }}>Contact Information</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                            {[{ label: 'Email', value: user.email }, { label: 'Phone', value: user.phone || '—' }].map(f => (
                                                <div key={f.label} style={{ background: '#1A1A26', borderRadius: '8px', padding: '10px 12px', border: '1px solid #22222E' }}>
                                                    <div style={{ fontSize: '0.55rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{f.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#C0B8AE', wordBreak: 'break-all' }}>{f.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Section: Account Details ── */}
                                        <div style={{ fontSize: '0.52rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '8px' }}>Account Details</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                            {[
                                                { label: 'Member ID', value: user.uniqueId, mono: true },
                                                { label: 'Referral Code', value: user.referralCode || '—', mono: true },
                                                { label: 'Rank', value: user.rank && user.rank > 0 ? `Level ${user.rank}` : 'Unranked' },
                                                { label: 'Registered', value: fmtDate(user.createdAt) },
                                                { label: 'Activated', value: user.activatedAt ? fmtDate(user.activatedAt) : 'Not yet' },
                                                { label: 'Blocked', value: user.isBlocked ? 'Yes' : 'No' },
                                            ].map(f => (
                                                <div key={f.label} style={{ background: '#1A1A26', borderRadius: '8px', padding: '10px 12px', border: '1px solid #22222E' }}>
                                                    <div style={{ fontSize: '0.55rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{f.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: (f as any).mono ? '#C4956A' : '#C0B8AE', fontFamily: (f as any).mono ? 'monospace' : 'inherit' }}>{f.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Section: Referral Network ── */}
                                        <div style={{ fontSize: '0.52rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '8px' }}>Referral Network</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                            {[
                                                { label: 'Referred By', value: user.referredBy ? `${user.referredBy.name} (${user.referredBy.uniqueId})` : 'Direct / Admin', color: user.referredBy ? '#C4956A' : '#555' },
                                                { label: 'Team Lead', value: user.teamLead ? `${user.teamLead.name} (${user.teamLead.uniqueId})` : 'None', color: user.teamLead ? '#60A5FA' : '#555' },
                                            ].map(f => (
                                                <div key={f.label} style={{ background: '#1A1A26', borderRadius: '8px', padding: '10px 12px', border: '1px solid #22222E' }}>
                                                    <div style={{ fontSize: '0.55rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{f.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: f.color }}>{f.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Section: Financial Summary ── */}
                                        <div style={{ fontSize: '0.52rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '8px' }}>Financial Summary</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                                            {[
                                                { label: 'Self Investment', value: user.selfInvestment || 0, color: '#6ee7b7' },
                                                { label: 'Team Volume', value: user.totalBusiness || 0, color: '#93c5fd' },
                                                { label: 'Self Reward', value: user.selfReward || 0, color: '#fbbf24' },
                                                { label: 'Direct Bonus', value: user.directBonus || 0, color: '#f472b6' },
                                                { label: 'Team Bonus', value: user.teamBonus || 0, color: '#a78bfa' },
                                                { label: 'Total Earnings', value: (user.selfReward || 0) + (user.directBonus || 0) + (user.teamBonus || 0), color: '#C4956A' },
                                            ].map(f => (
                                                <div key={f.label} style={{ background: `${f.color}0D`, borderRadius: '8px', padding: '10px 12px', border: `1px solid ${f.color}22` }}>
                                                    <div style={{ fontSize: '0.5rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{f.label}</div>
                                                    <div style={{ fontSize: '0.9rem', color: f.color, fontWeight: 700 }}>₹{(f.value).toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid #22222E' }}>
                                            {user.status === 'PENDING' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ id: user.id, action: 'activate', name: user.name }); }}
                                                    style={{
                                                        padding: '8px 20px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none',
                                                        boxShadow: '0 2px 8px rgba(34,197,94,0.3)', transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                                    onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                                                >
                                                    ✓ Activate
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmModal({ id: user.id, action: user.isBlocked ? 'unblock' : 'block', name: user.name }); }}
                                                style={{
                                                    padding: '8px 20px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                    background: 'transparent', color: user.isBlocked ? '#22c55e' : '#ef4444',
                                                    border: `1px solid ${user.isBlocked ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.background = user.isBlocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'; }}
                                                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                {user.isBlocked ? '✓ Unblock' : '✗ Block'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── CONFIRMATION MODAL ─── */}
            {confirmModal && (
                <div
                    onClick={() => !updating && setConfirmModal(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#1A1A24', borderRadius: '16px', padding: '28px 32px',
                            width: '100%', maxWidth: '420px',
                            border: '1px solid #2E2E3E', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            animation: 'slideUp 0.2s ease-out',
                        }}
                    >
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                            background: confirmModal.action === 'activate' ? 'rgba(34,197,94,0.12)' : confirmModal.action === 'unblock' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        }}>
                            {confirmModal.action === 'activate' ? '✓' : confirmModal.action === 'unblock' ? '✓' : '✗'}
                        </div>

                        <h3 style={{ textAlign: 'center', color: '#F5F0EB', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>
                            {confirmModal.action === 'activate' ? 'Activate User' : confirmModal.action === 'unblock' ? 'Unblock User' : 'Block User'}
                        </h3>
                        <p style={{ textAlign: 'center', color: '#8A8A96', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                            Are you sure you want to <strong style={{ color: confirmModal.action === 'block' ? '#ef4444' : '#22c55e' }}>{confirmModal.action}</strong> <strong style={{ color: '#C4956A' }}>{confirmModal.name}</strong>?
                        </p>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={updating}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                                    background: '#22222E', color: '#8A8A96', border: '1px solid #333340', cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={updating}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                                    background: confirmModal.action === 'block' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff', border: 'none', cursor: updating ? 'not-allowed' : 'pointer',
                                    opacity: updating ? 0.7 : 1, transition: 'all 0.15s',
                                }}
                            >
                                {updating ? 'Processing...' : `Yes, ${confirmModal.action}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ADD USER MODAL ─── */}
            {showAddModal && (
                <div
                    onClick={() => setShowAddModal(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#1A1A24', borderRadius: '16px', padding: '28px 32px',
                            width: '100%', maxWidth: '440px',
                            border: '1px solid #2E2E3E', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            animation: 'slideUp 0.2s ease-out',
                        }}
                    >
                        <h3 style={{ color: '#C4956A', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Add New User</h3>

                        {formError && <div style={{ marginBottom: '12px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{formError}</div>}

                        <form onSubmit={handleAddUser}>
                            {['name', 'email', 'phone', 'password'].map(field => (
                                <div key={field} style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '4px' }}>{field}</label>
                                    <input
                                        type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                                        value={(formData as any)[field]}
                                        onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem',
                                            background: '#22222E', border: '1px solid #333340', color: '#F5F0EB', outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = '#C4956A')}
                                        onBlur={e => (e.currentTarget.style.borderColor = '#333340')}
                                        required={field !== 'phone'}
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                                    background: '#22222E', color: '#8A8A96', border: '1px solid #333340', cursor: 'pointer',
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                                    background: 'linear-gradient(135deg, #C4956A, #a87a50)', color: '#fff', border: 'none', cursor: 'pointer',
                                }}>Add User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
                @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
            `}</style>
        </div>
    );
}
