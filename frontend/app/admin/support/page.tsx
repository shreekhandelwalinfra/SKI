'use client';

import { useState, useEffect } from 'react';
import { getSupportTickets, updateSupportTicket, markTicketSeen, deleteSupportTicket, deleteTicketMessage } from '../lib/api';

interface TicketMessage {
    sender: 'user' | 'admin';
    text: string;
    time: string;
}

interface TicketItem {
    id: string;
    userId: string | null;
    user: { name: string; uniqueId: string; email: string } | null;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    adminReply: string;
    messages: TicketMessage[];
    lastSeenByAdmin: string | null;
    lastSeenByUser: string | null;
    createdAt: string;
    updatedAt: string;
}

function hasUnseenMessages(ticket: TicketItem): boolean {
    if (!ticket.lastSeenByAdmin) return true; // never seen = unseen
    const lastSeen = new Date(ticket.lastSeenByAdmin).getTime();
    const msgs: TicketMessage[] = Array.isArray(ticket.messages) ? ticket.messages : [];
    // Check if any user message exists after lastSeen
    return msgs.some(m => m.sender === 'user' && new Date(m.time).getTime() > lastSeen);
}

function unseenCount(ticket: TicketItem): number {
    if (!ticket.lastSeenByAdmin) {
        const msgs: TicketMessage[] = Array.isArray(ticket.messages) ? ticket.messages : [];
        return msgs.filter(m => m.sender === 'user').length;
    }
    const lastSeen = new Date(ticket.lastSeenByAdmin).getTime();
    const msgs: TicketMessage[] = Array.isArray(ticket.messages) ? ticket.messages : [];
    return msgs.filter(m => m.sender === 'user' && new Date(m.time).getTime() > lastSeen).length;
}

import { io } from 'socket.io-client';
import { useRef } from 'react';

export default function SupportPage() {
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmDeleteMsg, setConfirmDeleteMsg] = useState<{ ticketId: string, index: number } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadTickets = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getSupportTickets(statusFilter ? `status=${statusFilter}` : undefined);
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => { loadTickets(); }, [statusFilter]);

    // WebSocket connection for real-time updates
    useEffect(() => {
        const URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(URL, { withCredentials: true });

        socket.on('connect', () => console.log('Admin Socket connected:', socket.id));
        socket.on('support:updated', (payload?: { action: string, ticket?: any, ticketId?: string }) => {
            if (!payload) {
                loadTickets(true);
                return;
            }
            setTickets(prev => {
                const { action, ticket, ticketId } = payload;
                if (action === 'create' && ticket) {
                    // Check filter: if not matching current filter, ignore
                    if (statusFilter && ticket.status !== statusFilter) return prev;
                    if (prev.some(t => t.id === ticket.id)) return prev;
                    return [ticket, ...prev];
                } else if (action === 'update' && ticket) {
                    // If target status no longer matches current filter, remove it
                    if (statusFilter && ticket.status !== statusFilter) {
                        return prev.filter(t => t.id !== ticket.id);
                    }
                    // If it matches but wasn't in array (e.g. status changed to match), add it
                    if (!prev.some(t => t.id === ticket.id)) {
                        return [ticket, ...prev];
                    }
                    // Otherwise just update it
                    return prev.map(t => t.id === ticket.id ? ticket : t);
                } else if (action === 'delete' && ticketId) {
                    return prev.filter(t => t.id !== ticketId);
                }
                return prev;
            });
        });

        return () => { socket.disconnect(); };
    }, [statusFilter]);

    // Auto-mark as seen and auto-scroll if ticket is currently expanded
    useEffect(() => {
        if (!expandedTicket) return;

        // Auto-scroll to bottom of messages
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        const ticket = tickets.find(t => t.id === expandedTicket);
        if (ticket && hasUnseenMessages(ticket)) {
            // optimistically update local state to avoid rapid re-fires
            setTickets(prev => prev.map(t =>
                t.id === expandedTicket ? { ...t, lastSeenByAdmin: new Date().toISOString() } : t
            ));
            markTicketSeen(expandedTicket).catch(() => { });
        }
    }, [tickets, expandedTicket]);

    // Mark ticket as seen when expanded
    const handleExpand = async (ticketId: string) => {
        if (expandedTicket === ticketId) {
            setExpandedTicket(null);
            return;
        }
        setExpandedTicket(ticketId);
        setReplyText('');
        setConfirmDelete(null);

        // Mark as seen in background
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket && hasUnseenMessages(ticket)) {
            try {
                await markTicketSeen(ticketId);
                // Optimistic update: set lastSeenByAdmin locally
                setTickets(prev => prev.map(t =>
                    t.id === ticketId ? { ...t, lastSeenByAdmin: new Date().toISOString() } : t
                ));
            } catch { /* silent */ }
        }
    };

    // Send reply without changing status
    const handleSendReply = async (id: string) => {
        if (!replyText.trim()) return;
        try {
            setUpdating(id);
            await updateSupportTicket(id, { adminReply: replyText });
            loadTickets(true);
            setReplyText('');
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    // Change status (optionally with reply)
    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            setUpdating(id);
            const payload: any = { status };
            if (replyText.trim()) payload.adminReply = replyText;
            await updateSupportTicket(id, payload);
            loadTickets(true);
            setExpandedTicket(null);
            setReplyText('');
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    // Delete ticket
    const handleDelete = async (id: string) => {
        try {
            setUpdating(id);
            await deleteSupportTicket(id);
            setTickets(prev => prev.filter(t => t.id !== id));
            setExpandedTicket(null);
            setConfirmDelete(null);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    // Delete individual admin message
    const handleDeleteMessage = async (ticketId: string, messageIndex: number) => {
        try {
            setUpdating(`${ticketId}-msg-${messageIndex}`);
            const res = await deleteTicketMessage(ticketId, messageIndex);
            // Update ticket in state
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: res.data.messages } : t));
        } catch (err) {
            console.error(err);
            // Refresh on error to ensure sync
            loadTickets();
        } finally {
            setUpdating(null);
        }
    };

    const statusStyle = (status: string): { bg: string; text: string; dot: string; label: string } => {
        switch (status) {
            case 'RESOLVED': return { bg: 'rgba(16,185,129,0.1)', text: '#10b981', dot: '#10b981', label: 'Resolved' };
            case 'IN_PROGRESS': return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', dot: '#3b82f6', label: 'In Progress' };
            default: return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', dot: '#f59e0b', label: 'Open' };
        }
    };

    const ticketBorderColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return '#10b981';
            case 'IN_PROGRESS': return '#3b82f6';
            default: return '#f59e0b';
        }
    };

    const filterButtons = [
        { value: '', label: 'All' },
        { value: 'OPEN', label: 'Open' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'RESOLVED', label: 'Resolved' },
    ];

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Total unseen tickets count
    const totalUnseen = tickets.filter(t => hasUnseenMessages(t)).length;

    return (
        <div className="animate-slideInUp">
            {/* Page header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#7A7A8A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '4px' }}>Customer</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.04em' }}>Support Tickets</h1>
                    {totalUnseen > 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: '22px', height: '22px', borderRadius: '11px', padding: '0 6px',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
                            fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-inter), sans-serif',
                            boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}>
                            {totalUnseen} new
                        </span>
                    )}
                </div>
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
                        const isExpanded = expandedTicket === ticket.id;
                        const msgs: TicketMessage[] = Array.isArray(ticket.messages) ? ticket.messages : [];
                        const unseen = hasUnseenMessages(ticket);
                        const unseenNum = unseenCount(ticket);
                        return (
                            <div
                                key={ticket.id}
                                className="glass-card"
                                style={{
                                    overflow: 'hidden',
                                    borderLeft: `3px solid ${unseen ? '#ef4444' : ticketBorderColor(ticket.status)}`,
                                    borderRadius: '12px',
                                    position: 'relative',
                                }}
                            >
                                {/* Unseen glow effect */}
                                {unseen && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                        background: 'linear-gradient(90deg, #ef4444, #f97316, transparent)',
                                        opacity: 0.7,
                                    }} />
                                )}

                                {/* Ticket Header (clickable) */}
                                <button
                                    onClick={() => handleExpand(ticket.id)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                >
                                    <div style={{ flex: 1, marginRight: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F5F0EB', fontFamily: 'var(--font-inter), sans-serif' }}>{ticket.subject}</span>
                                            <span style={{ padding: '2px 9px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600, background: s.bg, color: s.text, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                                {s.label}
                                            </span>
                                            {/* Unseen badge */}
                                            {unseen && (
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '999px', fontSize: '0.62rem', fontWeight: 700,
                                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    boxShadow: '0 1px 6px rgba(239,68,68,0.35)',
                                                    letterSpacing: '0.03em',
                                                }}>
                                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                                    {unseenNum} new
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif' }}>
                                            {ticket.user?.name || ticket.name} ({ticket.user?.uniqueId || ''}) · {ticket.email} · {new Date(ticket.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#C4956A', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                </button>

                                {/* Expanded Panel */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid var(--admin-border)', padding: '1.25rem' }} className="animate-slideInUp">
                                        {/* Chat-style messages */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '0.5rem' }}>Conversation</div>

                                            {msgs.length > 0 ? (
                                                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-border)' }}>
                                                    {msgs.map((m, i) => {
                                                        // Determine if this user message is unseen
                                                        const isUnseen = m.sender === 'user' && (
                                                            !ticket.lastSeenByAdmin || new Date(m.time).getTime() > new Date(ticket.lastSeenByAdmin).getTime()
                                                        );
                                                        // Determine if admin message was seen by user
                                                        const isSeenByUser = m.sender === 'admin' && ticket.lastSeenByUser && new Date(m.time).getTime() <= new Date(ticket.lastSeenByUser).getTime();
                                                        return (
                                                            <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-start' : 'flex-end' }}>
                                                                <div style={{
                                                                    maxWidth: '75%', padding: '0.65rem 0.9rem', borderRadius: '10px',
                                                                    borderBottomLeftRadius: m.sender === 'user' ? '2px' : '10px',
                                                                    borderBottomRightRadius: m.sender === 'admin' ? '2px' : '10px',
                                                                    fontSize: '0.82rem', lineHeight: 1.6, fontFamily: 'var(--font-inter), sans-serif',
                                                                    background: m.sender === 'user'
                                                                        ? (isUnseen ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)')
                                                                        : 'rgba(196,149,106,0.12)',
                                                                    color: '#C0B8AE',
                                                                    border: isUnseen ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                                                                    position: 'relative',
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', marginBottom: '0.25rem', fontWeight: 600, color: m.sender === 'user' ? (isUnseen ? '#ef4444' : '#f59e0b') : '#C4956A' }}>
                                                                        {m.sender === 'user' ? 'Customer' : 'Admin'} · {m.time ? formatDate(m.time) : ''}
                                                                        {isUnseen && (
                                                                            <span style={{
                                                                                padding: '1px 5px', borderRadius: '3px', fontSize: '0.5rem',
                                                                                background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 700,
                                                                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                                                            }}>New</span>
                                                                        )}
                                                                    </div>
                                                                    {m.text}
                                                                    {/* Read receipt and delete for admin messages */}
                                                                    {m.sender === 'admin' && (
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', gap: '8px', alignItems: 'center' }}>
                                                                            {confirmDeleteMsg?.ticketId === ticket.id && confirmDeleteMsg?.index === i ? (
                                                                                <div style={{
                                                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                                                    background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px',
                                                                                    border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.65rem'
                                                                                }} className="animate-fadeIn">
                                                                                    <span style={{ color: '#ef4444', fontWeight: 500 }}>Delete?</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault(); e.stopPropagation();
                                                                                            handleDeleteMessage(ticket.id, i);
                                                                                            setConfirmDeleteMsg(null);
                                                                                        }}
                                                                                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1px 6px', borderRadius: '3px', cursor: 'pointer', fontWeight: 600 }}
                                                                                    >Yes</button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault(); e.stopPropagation();
                                                                                            setConfirmDeleteMsg(null);
                                                                                        }}
                                                                                        style={{ background: 'rgba(255,255,255,0.1)', color: '#C0B8AE', border: 'none', padding: '1px 6px', borderRadius: '3px', cursor: 'pointer' }}
                                                                                    >No</button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        setConfirmDeleteMsg({ ticketId: ticket.id, index: i });
                                                                                    }}
                                                                                    disabled={updating === `${ticket.id}-msg-${i}`}
                                                                                    style={{
                                                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                                                        fontSize: '0.65rem', color: '#ef4444', opacity: 0.6,
                                                                                        padding: '2px 4px', borderRadius: '4px',
                                                                                        transition: 'opacity 0.2s',
                                                                                    }}
                                                                                    onMouseOver={e => e.currentTarget.style.opacity = '1'}
                                                                                    onMouseOut={e => e.currentTarget.style.opacity = '0.6'}
                                                                                    title="Delete message"
                                                                                >
                                                                                    {updating === `${ticket.id}-msg-${i}` ? '...' : '🗑️'}
                                                                                </button>
                                                                            )}
                                                                            <span style={{ fontSize: '0.55rem', color: isSeenByUser ? '#3b82f6' : '#666', fontWeight: 500 }}>
                                                                                {isSeenByUser ? '✓✓ Seen' : '✓ Sent'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#C0B8AE', fontFamily: 'var(--font-inter), sans-serif', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>{ticket.message}</p>
                                            )}
                                        </div>

                                        {/* Admin Reply Input */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '0.5rem' }}>Reply</div>
                                            <textarea
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        if (replyText.trim() && updating !== ticket.id) {
                                                            handleSendReply(ticket.id);
                                                        }
                                                    }
                                                }}
                                                rows={3}
                                                className="admin-input"
                                                style={{ resize: 'vertical' }}
                                                placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                                            />
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {/* Send Reply */}
                                            <button
                                                onClick={() => handleSendReply(ticket.id)}
                                                disabled={updating === ticket.id || !replyText.trim()}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(196,149,106,0.4)',
                                                    background: 'rgba(196,149,106,0.15)', color: '#C4956A', fontSize: '0.75rem',
                                                    fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-inter), sans-serif',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    opacity: (updating === ticket.id || !replyText.trim()) ? 0.5 : 1,
                                                }}
                                            >
                                                💬 Send Reply
                                            </button>
                                            {/* Set In Progress */}
                                            <button
                                                onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                                                disabled={updating === ticket.id}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)',
                                                    background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '0.75rem',
                                                    fontWeight: 500, letterSpacing: '0.05em', fontFamily: 'var(--font-inter), sans-serif',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    opacity: updating === ticket.id ? 0.6 : 1,
                                                }}
                                            >
                                                Set In Progress
                                            </button>
                                            {/* Mark Resolved */}
                                            <button
                                                onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')}
                                                disabled={updating === ticket.id}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)',
                                                    background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.75rem',
                                                    fontWeight: 500, letterSpacing: '0.05em', fontFamily: 'var(--font-inter), sans-serif',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    opacity: updating === ticket.id ? 0.6 : 1,
                                                }}
                                            >
                                                Mark Resolved
                                            </button>

                                            {/* Delete — pushed to far right */}
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {confirmDelete === ticket.id ? (
                                                    <>
                                                        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>Sure?</span>
                                                        <button
                                                            onClick={() => handleDelete(ticket.id)}
                                                            disabled={updating === ticket.id}
                                                            style={{
                                                                padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.5)',
                                                                background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.7rem',
                                                                fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                                                                cursor: 'pointer', transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            Yes, Delete
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            style={{
                                                                padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--admin-border)',
                                                                background: 'transparent', color: '#7A7A8A', fontSize: '0.7rem',
                                                                fontWeight: 500, fontFamily: 'var(--font-inter), sans-serif',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(ticket.id)}
                                                        style={{
                                                            padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)',
                                                            background: 'transparent', color: '#7A7A8A', fontSize: '0.7rem',
                                                            fontWeight: 500, fontFamily: 'var(--font-inter), sans-serif',
                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                        }}
                                                        title="Delete this ticket"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </div>
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
