'use client';

import { useState } from 'react';
import { getAdminLogs } from '../lib/api';
import useSWR from 'swr';

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    ACTIVATE_USER: { label: 'Activate User', color: '#34D399', icon: '✅' },
    BLOCK_USER: { label: 'Block User', color: '#ef4444', icon: '🚫' },
    UNBLOCK_USER: { label: 'Unblock User', color: '#60A5FA', icon: '🔓' },
    APPROVE_INVESTMENT: { label: 'Approve Investment', color: '#34D399', icon: '💰' },
    REJECT_INVESTMENT: { label: 'Reject Investment', color: '#ef4444', icon: '❌' },
    EDIT_BALANCE: { label: 'Edit Balance', color: '#FBBF24', icon: '✏️' },
};

export default function AdminLogsPage() {
    const [page, setPage] = useState(1);
    const [filterAction, setFilterAction] = useState('');

    const fetchLogs = async () => {
        const res = await getAdminLogs(page, 30, filterAction ? { action: filterAction } : undefined);
        return res.data;
    };

    const { data, isLoading: loading } = useSWR(['admin_logs', page, filterAction], fetchLogs);
    const logs = data?.logs || [];
    const totalPages = data?.pages || 1;

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getActionInfo = (action: string) => ACTION_LABELS[action] || { label: action, color: '#7A7A8A', icon: '📌' };

    return (
        <div>
            <div className="section-label" style={{ fontSize: '0.65rem' }}>Administration</div>
            <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading, #F5F0EB)', marginBottom: '1.5rem' }}>
                Audit Logs
            </h2>

            {/* Filter bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[{ k: '', l: 'All Actions' }, ...Object.entries(ACTION_LABELS).map(([k, v]) => ({ k, l: v.label }))].map(f => (
                    <button
                        key={f.k}
                        onClick={() => { setPage(1); setFilterAction(f.k); }}
                        style={{
                            padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'var(--font-inter, sans-serif)',
                            border: '1px solid',
                            borderColor: filterAction === f.k ? 'var(--accent-copper, #C4956A)' : 'var(--admin-border, #1E293B)',
                            background: filterAction === f.k ? 'var(--accent-copper, #C4956A)' : 'transparent',
                            color: filterAction === f.k ? '#fff' : 'var(--text-secondary, #9CA3AF)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {f.l}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border, #1E293B)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-inter, sans-serif)' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-surface-alt, #111827)' }}>
                                {['Time', 'Admin', 'Action', 'Target', 'Details'].map(h => (
                                    <th key={h} className="text-tracked" style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.6rem', color: 'var(--text-muted, #6B7280)', fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted, #6B7280)' }}>Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted, #6B7280)' }}>No audit logs found</td></tr>
                            ) : logs.map((log: any) => {
                                const info = getActionInfo(log.action);
                                let details = '';
                                try { details = log.details ? JSON.stringify(JSON.parse(log.details), null, 0).slice(0, 80) : ''; } catch { details = log.details?.slice(0, 80) || ''; }
                                return (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle, #1E293B)' }}>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted, #9CA3AF)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary, #F5F0EB)', fontSize: '0.8rem' }}>{log.admin?.name || 'Admin'}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #7A7A8A)', fontFamily: 'monospace' }}>{log.admin?.uniqueId || ''}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                                                background: `${info.color}15`, color: info.color,
                                            }}>
                                                {info.icon} {info.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary, #D1D5DB)', fontSize: '0.8rem' }}>
                                            {log.targetName || log.targetId || '—'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted, #9CA3AF)', fontSize: '0.72rem', fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {details || '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--admin-border, #1E293B)' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--admin-border, #1E293B)', background: 'transparent', color: 'var(--text-secondary, #9CA3AF)', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
                            ← Prev
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted, #7A7A8A)' }}>
                            Page {page} of {totalPages}
                        </span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--admin-border, #1E293B)', background: 'transparent', color: 'var(--text-secondary, #9CA3AF)', cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
