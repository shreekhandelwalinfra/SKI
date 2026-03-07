'use client';

import { useState, useEffect } from 'react';
import { getInvestments, updateInvestmentStatus } from '../lib/api';
import useSWR from 'swr';
import { useSocket } from '../../../lib/SocketContext';

interface InvestmentItem {
    id: string;
    user: { name: string; uniqueId: string; email: string } | null;
    name: string;
    uniqueId: string;
    amount: number;
    propertyName: string;
    plotAreaSize: string;
    propertyValue: number;
    propertyAddress: string;
    installmentNo: string;
    transactionDate: string;
    transactionId: string;
    status: string;
    remarks: string;
}

export default function InvestmentsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [confirmModal, setConfirmModal] = useState<{ id: string; status: string; name: string } | null>(null);
    const [updating, setUpdating] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { socket } = useSocket();

    const fetchInvestments = async () => {
        const res = await getInvestments(statusFilter ? `status=${statusFilter}` : undefined);
        return res.data;
    };

    const { data: investmentsData, isLoading: loading, mutate: loadInvestments } = useSWR(
        ['admin_investments', statusFilter],
        fetchInvestments
    );
    const investments = investmentsData || [];

    // Socket.io — listen for real-time investment changes
    useEffect(() => {
        socket.on('investment:updated', loadInvestments);
        return () => { socket.off('investment:updated', loadInvestments); };
    }, [socket, loadInvestments]);

    const handleStatusUpdate = async () => {
        if (!confirmModal) return;
        setUpdating(true);
        try {
            await updateInvestmentStatus(confirmModal.id, { status: confirmModal.status });
            await loadInvestments();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
            setConfirmModal(null);
        }
    };

    const fmt = (n: number) => n > 0 ? `₹${n.toLocaleString('en-IN')}` : '—';
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const statusStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
        PENDING: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b', dot: '#f59e0b' },
        APPROVED: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#22c55e', dot: '#22c55e' },
        REJECTED: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#ef4444', dot: '#ef4444' },
    };

    const filterTabs = [
        { key: '', label: 'All', count: investments.length },
        { key: 'PENDING', label: 'Pending' },
        { key: 'APPROVED', label: 'Approved' },
        { key: 'REJECTED', label: 'Rejected' },
    ];

    return (
        <div style={{ position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C4956A', fontWeight: 600, marginBottom: '4px' }}>Administration</p>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F5F0EB', margin: 0 }}>Investment Requests</h1>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8A8A96', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Live · Auto-refreshing
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem', padding: '4px', background: '#15151E', borderRadius: '10px', border: '1px solid #22222E' }}>
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        style={{
                            flex: 1,
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
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
            ) : investments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '14px', background: '#1A1A24', border: '1px solid #22222E' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                    <p style={{ color: '#8A8A96', fontSize: '0.9rem' }}>No {statusFilter.toLowerCase() || ''} investments found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {investments.map((inv: InvestmentItem) => {
                        const ss = statusStyles[inv.status] || statusStyles.PENDING;
                        const isExpanded = expandedId === inv.id;

                        return (
                            <div
                                key={inv.id}
                                style={{
                                    borderRadius: '14px',
                                    background: '#1A1A24',
                                    border: `1px solid ${isExpanded ? '#333340' : '#22222E'}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {/* Main Row — Click to Expand */}
                                <div className="overflow-scroll-x">
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'minmax(160px, 1.5fr) minmax(130px, 1fr) minmax(100px, 0.8fr) auto auto',
                                            alignItems: 'center',
                                            padding: '14px 20px',
                                            cursor: 'pointer',
                                            gap: '16px',
                                            minWidth: '600px',
                                        }}
                                    >
                                        {/* Investor */}
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#F5F0EB', fontSize: '0.85rem' }}>{inv.user?.name || inv.name}</div>
                                            <div style={{ color: '#C4956A', fontFamily: 'monospace', fontSize: '0.7rem', marginTop: '2px' }}>{inv.user?.uniqueId || inv.uniqueId}</div>
                                        </div>

                                        {/* Property */}
                                        <div>
                                            <div style={{ color: '#C0B8AE', fontSize: '0.82rem', fontWeight: 500 }}>{inv.propertyName || '—'}</div>
                                            <div style={{ color: '#555', fontSize: '0.68rem', marginTop: '2px' }}>{inv.plotAreaSize || ''}</div>
                                        </div>

                                        {/* Amount */}
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: '#F5F0EB', fontSize: '0.9rem' }}>{fmt(inv.amount)}</div>
                                            {inv.propertyValue > 0 && <div style={{ color: '#555', fontSize: '0.65rem', marginTop: '2px' }}>of {fmt(inv.propertyValue)}</div>}
                                        </div>

                                        {/* Installment */}
                                        <div>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600,
                                                background: inv.installmentNo === 'Final' ? 'rgba(34,197,94,0.12)' : 'rgba(196,149,106,0.12)',
                                                color: inv.installmentNo === 'Final' ? '#22c55e' : '#C4956A',
                                            }}>
                                                {inv.installmentNo === 'Final' ? '✓ Final' : `#${inv.installmentNo || '1'}`}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ss.dot }} />
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: ss.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{inv.status}</span>
                                            <span style={{ color: '#555', fontSize: '0.85rem', marginLeft: '4px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details + Actions */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #22222E', padding: '16px 20px', background: '#151520' }}>
                                        <div className="overflow-scroll-x">
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px', minWidth: '500px' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '4px' }}>Address</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#C0B8AE' }}>{inv.propertyAddress || '—'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '4px' }}>Date</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#C0B8AE' }}>{fmtDate(inv.transactionDate)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '4px' }}>Transaction ID</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#C4956A', fontFamily: 'monospace' }}>{inv.transactionId}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '4px' }}>Remarks</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#C0B8AE' }}>{inv.remarks || '—'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {inv.status !== 'APPROVED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ id: inv.id, status: 'APPROVED', name: inv.user?.name || inv.name }); }}
                                                    style={{
                                                        padding: '8px 20px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none',
                                                        boxShadow: '0 2px 8px rgba(34,197,94,0.3)', transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                                    onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                                                >
                                                    ✓ Approve
                                                </button>
                                            )}
                                            {inv.status !== 'REJECTED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ id: inv.id, status: 'REJECTED', name: inv.user?.name || inv.name }); }}
                                                    style={{
                                                        padding: '8px 20px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                        background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    ✗ Reject
                                                </button>
                                            )}
                                            {inv.status !== 'PENDING' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ id: inv.id, status: 'PENDING', name: inv.user?.name || inv.name }); }}
                                                    style={{
                                                        padding: '8px 20px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                                        background: 'transparent', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    ↺ Revert to Pending
                                                </button>
                                            )}
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
                        {/* Icon */}
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                            background: confirmModal.status === 'APPROVED' ? 'rgba(34,197,94,0.12)' : confirmModal.status === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                        }}>
                            {confirmModal.status === 'APPROVED' ? '✓' : confirmModal.status === 'REJECTED' ? '✗' : '↺'}
                        </div>

                        {/* Text */}
                        <h3 style={{ textAlign: 'center', color: '#F5F0EB', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>
                            {confirmModal.status === 'APPROVED' ? 'Approve Investment' : confirmModal.status === 'REJECTED' ? 'Reject Investment' : 'Revert to Pending'}
                        </h3>
                        <p style={{ textAlign: 'center', color: '#8A8A96', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                            Are you sure you want to <strong style={{ color: statusStyles[confirmModal.status]?.text }}>{confirmModal.status.toLowerCase()}</strong> the investment submitted by <strong style={{ color: '#C4956A' }}>{confirmModal.name}</strong>?
                        </p>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={updating}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                                    background: '#22222E', color: '#8A8A96', border: '1px solid #333340', cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = '#2A2A38')}
                                onMouseOut={e => (e.currentTarget.style.background = '#22222E')}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                                    background: confirmModal.status === 'APPROVED' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : confirmModal.status === 'REJECTED' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: '#fff', border: 'none', cursor: updating ? 'not-allowed' : 'pointer',
                                    boxShadow: `0 4px 12px ${confirmModal.status === 'APPROVED' ? 'rgba(34,197,94,0.3)' : confirmModal.status === 'REJECTED' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                    opacity: updating ? 0.7 : 1, transition: 'all 0.15s',
                                }}
                                onMouseOver={e => !updating && (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {updating ? 'Processing...' : `Yes, ${confirmModal.status === 'APPROVED' ? 'Approve' : confirmModal.status === 'REJECTED' ? 'Reject' : 'Revert'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
                @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
                @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
            `}</style>
        </div>
    );
}
