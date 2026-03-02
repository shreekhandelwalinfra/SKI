'use client';

import { useState, useEffect } from 'react';
import { getSupportTickets, updateSupportTicket } from '../lib/api';

interface TicketItem {
    _id: string;
    userId: { name: string; uniqueId: string; email: string } | null;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    adminReply: string;
    createdAt: string;
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => { loadTickets(); }, [statusFilter]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const res = await getSupportTickets(statusFilter ? `status=${statusFilter}` : undefined);
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string, adminReply?: string) => {
        try {
            setUpdating(id);
            await updateSupportTicket(id, { status, adminReply: adminReply || '' });
            loadTickets();
            setExpandedTicket(null);
            setReplyText('');
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const statusStyle = (status: string): { bg: string; text: string; dot: string; label: string } => {
        switch (status) {
            case 'resolved': return { bg: 'rgba(16,185,129,0.1)', text: '#10b981', dot: '#10b981', label: 'Resolved' };
            case 'inProgress': return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', dot: '#3b82f6', label: 'In Progress' };
            default: return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', dot: '#f59e0b', label: 'Open' };
        }
    };

    const ticketBorderColor = (status: string) => {
        switch (status) {
            case 'resolved': return '#10b981';
            case 'inProgress': return '#3b82f6';
            default: return '#f59e0b';
        }
    };

    const filterButtons = [
        { value: '', label: 'All' },
        { value: 'open', label: 'Open' },
        { value: 'inProgress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
    ];

    return (
        <div className="animate-slideInUp">
            {/* Page header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#7A7A8A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '4px' }}>Customer</div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.04em' }}>Support Tickets</h1>
                <div style={{ marginTop: '6px', width: '40px', height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574)' }} />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {filterButtons.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        style={{
                            padding: '0.45rem 1rem', borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em',
                            fontFamily: 'var(--font-inter), sans-serif', cursor: 'pointer', border: 'none',
                            background: statusFilter === f.value ? '#C4956A' : 'rgba(196,149,106,0.08)',
                            color: statusFilter === f.value ? '#fff' : '#7A7A8A',
                            boxShadow: statusFilter === f.value ? '0 4px 12px rgba(196,149,106,0.25)' : 'none',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {f.label}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', alignSelf: 'center' }}>
                    {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                </span>
            </div>

            {/* Tickets */}
            {loading ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.85rem' }}>Loading...</div>
            ) : tickets.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: '#7A7A8A', margin: '0 auto 1rem' }}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                    <div style={{ fontSize: '0.85rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif' }}>No support tickets found.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tickets.map(ticket => {
                        const s = statusStyle(ticket.status);
                        const isExpanded = expandedTicket === ticket._id;
                        return (
                            <div
                                key={ticket._id}
                                className="glass-card"
                                style={{
                                    overflow: 'hidden',
                                    borderLeft: `3px solid ${ticketBorderColor(ticket.status)}`,
                                    borderRadius: '12px',
                                }}
                            >
                                {/* Ticket Header (clickable) */}
                                <button
                                    onClick={() => {
                                        setExpandedTicket(isExpanded ? null : ticket._id);
                                        setReplyText(ticket.adminReply || '');
                                    }}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                >
                                    <div style={{ flex: 1, marginRight: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F5F0EB', fontFamily: 'var(--font-inter), sans-serif' }}>{ticket.subject}</span>
                                            <span style={{ padding: '2px 9px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600, background: s.bg, color: s.text, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                                {s.label}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif' }}>
                                            {ticket.name} · {ticket.email} · {new Date(ticket.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#C4956A', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                </button>

                                {/* Expanded Panel */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid var(--admin-border)', padding: '1.25rem' }} className="animate-slideInUp">
                                        {/* Original message */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '0.5rem' }}>User Message</div>
                                            <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#C0B8AE', fontFamily: 'var(--font-inter), sans-serif', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>{ticket.message}</p>
                                        </div>

                                        {/* Admin Reply */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '0.5rem' }}>Admin Reply</div>
                                            <textarea
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                rows={3}
                                                className="admin-input"
                                                style={{ resize: 'vertical' }}
                                                placeholder="Type your reply to this ticket..."
                                            />
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleStatusUpdate(ticket._id, 'inProgress', replyText)}
                                                disabled={updating === ticket._id}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)',
                                                    background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '0.75rem',
                                                    fontWeight: 500, letterSpacing: '0.05em', fontFamily: 'var(--font-inter), sans-serif',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    opacity: updating === ticket._id ? 0.6 : 1,
                                                }}
                                            >
                                                Set In Progress
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(ticket._id, 'resolved', replyText)}
                                                disabled={updating === ticket._id}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)',
                                                    background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.75rem',
                                                    fontWeight: 500, letterSpacing: '0.05em', fontFamily: 'var(--font-inter), sans-serif',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    opacity: updating === ticket._id ? 0.6 : 1,
                                                }}
                                            >
                                                Mark Resolved
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
