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

    useEffect(() => {
        loadTickets();
    }, [statusFilter]);

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
            await updateSupportTicket(id, { status, adminReply: adminReply || '' });
            loadTickets();
            setExpandedTicket(null);
            setReplyText('');
        } catch (err) {
            console.error(err);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'resolved': return { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' };
            case 'inProgress': return { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' };
            default: return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
        }
    };

    const statusLabel = (s: string) => {
        switch (s) {
            case 'inProgress': return 'In Progress';
            case 'resolved': return 'Resolved';
            default: return 'Open';
        }
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['', 'open', 'inProgress', 'resolved'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className="px-4 py-2 rounded text-xs uppercase tracking-widest font-medium transition-all"
                        style={{
                            background: statusFilter === s ? '#C4956A' : '#22222E',
                            color: statusFilter === s ? '#FFF' : '#8A8A96',
                            border: `1px solid ${statusFilter === s ? '#C4956A' : '#333340'}`,
                        }}
                    >
                        {s === '' ? 'All' : statusLabel(s)}
                    </button>
                ))}
            </div>

            {/* Tickets */}
            {loading ? (
                <div className="text-center py-12" style={{ color: '#8A8A96' }}>Loading...</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-12 rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E', color: '#8A8A96' }}>
                    No support tickets found.
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(ticket => {
                        const sc = statusColor(ticket.status);
                        const isExpanded = expandedTicket === ticket._id;

                        return (
                            <div key={ticket._id} className="rounded-lg overflow-hidden" style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}>
                                {/* Ticket Header */}
                                <button
                                    onClick={() => {
                                        setExpandedTicket(isExpanded ? null : ticket._id);
                                        setReplyText(ticket.adminReply || '');
                                    }}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                                >
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium" style={{ color: '#F5F0EB' }}>{ticket.subject}</span>
                                            <span className="px-2 py-0.5 rounded text-[11px]" style={{ background: sc.bg, color: sc.text }}>
                                                {statusLabel(ticket.status)}
                                            </span>
                                        </div>
                                        <div className="text-xs" style={{ color: '#8A8A96' }}>
                                            {ticket.name} • {ticket.email} • {new Date(ticket.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span style={{ color: '#C4956A' }}>{isExpanded ? '▼' : '▶'}</span>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-5 pb-5" style={{ borderTop: '1px solid #2E2E3E' }}>
                                        {/* Message */}
                                        <div className="mt-4 mb-4">
                                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A96' }}>Message</div>
                                            <p className="text-sm leading-relaxed" style={{ color: '#C0B8AE' }}>{ticket.message}</p>
                                        </div>

                                        {/* Admin Reply */}
                                        <div className="mb-4">
                                            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A96' }}>Admin Reply</div>
                                            <textarea
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded text-sm outline-none resize-none"
                                                style={{ background: '#22222E', border: '1px solid #333340', color: '#F5F0EB' }}
                                                placeholder="Type your reply..."
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(ticket._id, 'inProgress', replyText)}
                                                className="px-4 py-2 rounded text-xs uppercase tracking-widest"
                                                style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                                            >
                                                Mark In Progress
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(ticket._id, 'resolved', replyText)}
                                                className="px-4 py-2 rounded text-xs uppercase tracking-widest"
                                                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
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
