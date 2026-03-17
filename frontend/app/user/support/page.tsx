'use client';

import { useEffect, useState } from 'react';
import { getUserTickets, createUserTicket, replyToUserTicket, markTicketSeenByUser } from '../lib/api';

import { useSocket } from '../../../lib/SocketContext';
import { useRef } from 'react';

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();

    const loadTickets = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getUserTickets();
            setTickets(res.data);
        } catch { } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => { loadTickets(); }, []);

    // WebSocket connection for real-time updates (User)
    useEffect(() => {
        const handleUpdate = (payload?: { action: string, ticket?: any, ticketId?: string }) => {
            console.log('🗣️ USER Socket received support:updated:', payload);
            if (!payload) {
                loadTickets(true);
                return;
            }
            setTickets(prev => {
                const { action, ticket, ticketId } = payload;
                if (action === 'create' && ticket) {
                    // Prepend new ticket, avoid duplicates
                    if (prev.some(t => t.id === ticket.id)) return prev;
                    return [ticket, ...prev];
                } else if (action === 'update' && ticket) {
                    return prev.map(t => t.id === ticket.id ? ticket : t);
                } else if (action === 'delete' && ticketId) {
                    // Note: Users cannot delete tickets currently, but handle it for completeness
                    return prev.filter(t => t.id !== ticketId);
                }
                return prev;
            });
        };

        socket.on('support:updated', handleUpdate);

        return () => {
            socket.off('support:updated', handleUpdate);
        };
    }, [socket]);

    // Auto-mark as seen if ticket is currently expanded and receives new admin messages
    useEffect(() => {
        if (!expandedId) return;

        // Auto-scroll to bottom of messages
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        const ticket = tickets.find(t => t.id === expandedId);
        if (ticket && hasNewAdminMsg(ticket)) {
            // optimistically update local state to avoid rapid re-fires
            setTickets(prev => prev.map(t =>
                t.id === expandedId ? { ...t, lastSeenByUser: new Date().toISOString() } : t
            ));
            markTicketSeenByUser(expandedId).catch(() => { });
        }
    }, [tickets, expandedId]);

    const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); setSubmitting(true); try { const res = await createUserTicket(form); setTickets(prev => [res.data, ...prev]); setForm({ subject: '', message: '' }); setShowForm(false); } catch { } finally { setSubmitting(false); } };
    const handleReply = async (id: string) => { if (!replyText.trim()) return; setReplying(true); try { await replyToUserTicket(id, replyText); setReplyText(''); } catch { } finally { setReplying(false); } };

    // Expand ticket and mark as seen by user
    const handleExpand = async (id: string) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        setReplyText('');
        // Check if there are unseen admin messages
        const ticket = tickets.find(t => t.id === id);
        if (ticket) {
            const msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
            const lastSeen = ticket.lastSeenByUser ? new Date(ticket.lastSeenByUser).getTime() : 0;
            const hasNewAdmin = msgs.some((m: any) => m.sender === 'admin' && (!ticket.lastSeenByUser || new Date(m.time).getTime() > lastSeen));
            if (hasNewAdmin) {
                try {
                    await markTicketSeenByUser(id);
                    setTickets(prev => prev.map(t => t.id === id ? { ...t, lastSeenByUser: new Date().toISOString() } : t));
                } catch { /* silent */ }
            }
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const sBadge = (s: string) => s === 'RESOLVED' ? { bg: 'rgba(52,211,153,0.1)', c: '#34D399' } : s === 'IN_PROGRESS' ? { bg: 'rgba(96,165,250,0.1)', c: '#60A5FA' } : { bg: 'rgba(251,191,36,0.1)', c: '#FBBF24' };

    // Check if ticket has unseen admin messages
    const hasNewAdminMsg = (t: any) => {
        const msgs = Array.isArray(t.messages) ? t.messages : [];
        const lastSeen = t.lastSeenByUser ? new Date(t.lastSeenByUser).getTime() : 0;
        return msgs.some((m: any) => m.sender === 'admin' && (!t.lastSeenByUser || new Date(m.time).getTime() > lastSeen));
    };

    // Count unseen admin messages
    const unseenAdminCount = (t: any): number => {
        const msgs = Array.isArray(t.messages) ? t.messages : [];
        if (!t.lastSeenByUser) return msgs.filter((m: any) => m.sender === 'admin').length;
        const lastSeen = new Date(t.lastSeenByUser).getTime();
        return msgs.filter((m: any) => m.sender === 'admin' && new Date(m.time).getTime() > lastSeen).length;
    };

    // Total tickets with unseen messages
    const totalUnseen = tickets.filter(t => hasNewAdminMsg(t)).length;

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}><div className="skeleton" style={{ width: '200px', height: '16px' }} /></div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <div className="section-label" style={{ fontSize: '0.65rem' }}>Help Center</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>Support</h2>
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
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ borderRadius: '6px', fontSize: '0.75rem' }}>
                    {showForm ? 'Cancel' : '+ New Ticket'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Subject</label><input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input" required /></div>
                        <div><label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Message</label><textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="input" style={{ minHeight: '100px' }} required /></div>
                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ borderRadius: '6px', alignSelf: 'flex-start', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Submitting...' : 'Submit Ticket'}</button>
                    </form>
                </div>
            )}

            {tickets.length === 0 ? (
                <div className="card" style={{ borderRadius: '10px', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>No support tickets yet</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tickets.map(t => {
                        const sb = sBadge(t.status);
                        const isExpanded = expandedId === t.id;
                        const msgs = t.messages || [];
                        const hasNew = hasNewAdminMsg(t);
                        const newCount = unseenAdminCount(t);
                        return (
                            <div key={t.id} className="card" style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${hasNew ? 'var(--accent-copper)' : 'var(--border-color)'}` }}>
                                <div onClick={() => handleExpand(t.id)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.2s' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-inter), sans-serif' }}>{t.subject}</span>
                                            {hasNew && (
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '999px', fontSize: '0.62rem', fontWeight: 700,
                                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    boxShadow: '0 1px 6px rgba(239,68,68,0.35)',
                                                    letterSpacing: '0.03em',
                                                }}>
                                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                                    {newCount} new
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-inter), sans-serif' }}>{formatDate(t.createdAt)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, background: sb.bg, color: sb.c }}>{t.status.replace('_', ' ')}</span>
                                        <svg style={{ width: '16px', height: '16px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                            {msgs.map((m: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{ maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: m.sender === 'user' ? '2px' : '12px', borderBottomLeftRadius: m.sender !== 'user' ? '2px' : '12px', fontSize: '0.85rem', lineHeight: 1.6, fontFamily: 'var(--font-inter), sans-serif', background: m.sender === 'user' ? 'var(--accent-copper-subtle)' : 'var(--bg-surface-alt)', color: 'var(--text-primary)' }}>
                                                        <div style={{ fontSize: '0.65rem', marginBottom: '0.3rem', fontWeight: 600, color: m.sender === 'user' ? 'var(--accent-copper)' : 'var(--text-muted)' }}>{m.sender === 'user' ? 'You' : 'Admin'} · {formatDate(m.time)}</div>
                                                        {m.text}
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                        {t.status !== 'RESOLVED' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <textarea
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleReply(t.id);
                                                        }
                                                    }}
                                                    className="input"
                                                    placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                                                    style={{ flex: 1, resize: 'vertical', minHeight: '40px', padding: '0.6rem' }}
                                                    rows={1}
                                                />
                                                <button onClick={() => handleReply(t.id)} disabled={replying} className="btn btn-primary" style={{ borderRadius: '4px', fontSize: '0.75rem', padding: '0.5rem 1.25rem' }}>
                                                    {replying ? '...' : 'Send'}
                                                </button>
                                            </div>
                                        )}
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
