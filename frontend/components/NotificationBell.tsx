'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../lib/SocketContext';

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

interface NotificationBellProps {
    fetchNotifications: (page?: number, limit?: number) => Promise<any>;
    markAllRead: () => Promise<any>;
    markOneRead: (id: string) => Promise<any>;
    socketEvent: string; // 'notification:new' or 'admin_notification:new'
    filterByUserId?: string; // Only for user-side, to filter socket events
}

export default function NotificationBell({
    fetchNotifications, markAllRead, markOneRead, socketEvent, filterByUserId,
}: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();

    const load = async () => {
        try {
            setLoading(true);
            const res = await fetchNotifications(1, 15);
            const data = res.data || res;
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (e) {
            console.error('Failed to load notifications', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Real-time socket listener
    useEffect(() => {
        const handler = (payload: any) => {
            // For user-side, only react to notifications for this user
            if (filterByUserId && payload?.userId && payload.userId !== filterByUserId) return;
            load(); // Refetch all
        };
        socket.on(socketEvent, handler);
        return () => { socket.off(socketEvent, handler); };
    }, [socket, socketEvent, filterByUserId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkAllRead = async () => {
        await markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleClickNotification = async (n: NotificationItem) => {
        if (!n.isRead) {
            await markOneRead(n.id);
            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        if (n.link) {
            window.location.href = n.link;
        }
        setOpen(false);
    };

    const formatTime = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const typeIcon = (type: string) => {
        switch (type) {
            case 'INVESTMENT': return '💰';
            case 'PROFIT': return '💸';
            case 'SUPPORT': return '💬';
            case 'SYSTEM': return '🔔';
            default: return '📌';
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(!open); if (!open) load(); }}
                style={{
                    position: 'relative', background: 'transparent', border: 'none',
                    cursor: 'pointer', padding: '0.4rem', borderRadius: '8px',
                    transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                title="Notifications"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary, #a0a0a0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '2px', right: '2px',
                        background: '#ef4444', color: '#fff', fontSize: '0.6rem',
                        fontWeight: 700, borderRadius: '50%', minWidth: '16px', height: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1, padding: '0 3px',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                    width: '360px', maxHeight: '440px', overflowY: 'auto',
                    background: 'var(--bg-surface, #1a1a2e)', border: '1px solid var(--border-color, #333)',
                    borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    zIndex: 1000, fontFamily: 'var(--font-inter, sans-serif)',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle, #2a2a3e)',
                    }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading, #fff)' }}>
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '0.7rem', color: 'var(--accent-copper, #b87333)',
                                    fontWeight: 600, padding: '0.2rem 0.4rem',
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    {loading && notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #666)' }}>
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #666)', fontSize: '0.8rem' }}>
                            No notifications yet 🔕
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleClickNotification(n)}
                                style={{
                                    padding: '0.75rem 1rem', cursor: 'pointer',
                                    borderBottom: '1px solid var(--border-subtle, #2a2a3e)',
                                    background: n.isRead ? 'transparent' : 'rgba(184,115,51,0.04)',
                                    transition: 'background 0.15s',
                                    display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(184,115,51,0.04)')}
                            >
                                <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>{typeIcon(n.type)}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.78rem', fontWeight: n.isRead ? 500 : 700,
                                        color: n.isRead ? 'var(--text-secondary, #aaa)' : 'var(--text-heading, #fff)',
                                        marginBottom: '2px',
                                    }}>
                                        {n.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.72rem', color: 'var(--text-muted, #777)',
                                        lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    }}>
                                        {n.message}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted, #555)', marginTop: '3px' }}>
                                        {formatTime(n.createdAt)}
                                    </div>
                                </div>
                                {!n.isRead && (
                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: 'var(--accent-copper, #b87333)', marginTop: '6px', flexShrink: 0,
                                    }} />
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
