'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, cleanupData } from '../lib/api';
import useSWR from 'swr';
import { useSocket } from '../../../lib/SocketContext';

interface DashboardData {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    todayRegistrations: number;
    todayActivations: number;
    totalBusiness: number;
    totalSelfReward: number;
    totalDirectBonus: number;
    totalTeamBonus: number;
}

// Real estate palette: copper (#C4956A) as primary, with functional status colors
// kept for semantic meaning (green=active, amber=pending, etc.)
const statCards = [
    {
        key: 'totalUsers', label: 'Total Users', color: '#C4956A', glow: 'rgba(196,149,106,0.2)',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
        key: 'activeUsers', label: 'Active Users', color: '#10b981', glow: 'rgba(16,185,129,0.2)',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
        key: 'pendingUsers', label: 'Pending Users', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
        key: 'todayRegistrations', label: "Today's Registrations", color: '#D4A574', glow: 'rgba(212,165,116,0.2)',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>,
    },
    {
        key: 'todayActivations', label: "Today's Activations", color: '#94a3b8', glow: 'rgba(148,163,184,0.15)',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    },
    {
        key: 'totalBusiness', label: 'Total Business', color: '#C4956A', glow: 'rgba(196,149,106,0.25)', isCurrency: true,
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
    },
    {
        key: 'totalSelfReward', label: 'Total Self Reward', color: '#ec4899', glow: 'rgba(236,72,153,0.2)', isCurrency: true,
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
    },
    {
        key: 'totalDirectBonus', label: 'Direct Bonus', color: '#14b8a6', glow: 'rgba(20,184,166,0.2)', isCurrency: true,
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
    },
    {
        key: 'totalTeamBonus', label: 'Team Bonus', color: '#f97316', glow: 'rgba(249,115,22,0.2)', isCurrency: true,
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    },
];

export default function DashboardPage() {
    const [isCleaning, setIsCleaning] = useState(false);
    const { socket } = useSocket();

    const fetchStats = async () => {
        const res = await getDashboardStats();
        return res.data;
    };

    const { data, isLoading: loading, mutate: loadStats } = useSWR('admin_dashboard_stats', fetchStats);

    useEffect(() => {
        socket.on('investment:updated', loadStats);
        return () => { socket.off('investment:updated', loadStats); };
    }, [socket, loadStats]);

    const formatValue = (value: number, isCurrency?: boolean) => {
        if (isCurrency) {
            if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
            if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
            return `₹${value.toLocaleString('en-IN')}`;
        }
        return value.toLocaleString('en-IN');
    };

    const handleCleanup = async () => {
        if (!window.confirm('Are you sure you want to cleanup system data? This will delete all investments, profits, rewards, deals, and installments.\n\nAdmin and user accounts will be kept. This action CANNOT be undone.')) return;
        try {
            setIsCleaning(true);
            const res = await cleanupData();
            alert(res.message || 'System data cleaned up successfully!');
            await loadStats();
        } catch (err: any) {
            alert(err.message || 'Failed to cleanup system data');
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <div className="animate-slideInUp">
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.6rem', color: '#7A7A8A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '4px' }}>Welcome back</div>
                    <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.04em' }}>Dashboard Overview</h1>
                    <div style={{ marginTop: '6px', width: '40px', height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574)' }} />
                </div>
                <button
                    onClick={handleCleanup}
                    disabled={isCleaning || loading}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1.2rem', borderRadius: '8px',
                        fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
                        fontFamily: 'var(--font-inter), sans-serif',
                        background: 'rgba(244,63,94,0.07)', color: '#f43f5e',
                        border: '1px solid rgba(244,63,94,0.2)',
                        cursor: (isCleaning || loading) ? 'not-allowed' : 'pointer',
                        opacity: (isCleaning || loading) ? 0.6 : 1,
                        transition: 'all 0.2s',
                    }}
                >
                    {isCleaning ? (
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(244,63,94,0.3)', borderTopColor: '#f43f5e', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    )}
                    {isCleaning ? 'Cleaning...' : 'Cleanup Data'}
                </button>
            </div>

            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {statCards.map(card => (
                    <div
                        key={card.key}
                        className="admin-stat-card"
                        style={{ '--stat-color': card.color, '--stat-glow': card.glow } as React.CSSProperties}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon-circle" style={{ background: `${card.color}15`, border: `1px solid ${card.color}22`, color: card.color }}>
                                {card.icon}
                            </div>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: card.color, opacity: 0.6, marginTop: '4px' }} />
                        </div>
                        {loading ? (
                            <div style={{ height: '2rem', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.5rem' }} />
                        ) : (
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                                {data ? formatValue((data as any)[card.key], card.isCurrency) : '0'}
                            </div>
                        )}
                        <div style={{ fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif' }}>
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Overview Panel */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'linear-gradient(180deg, #C4956A, #D4A574)' }} />
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4956A', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600 }}>Quick Overview</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem' }}>
                    {[
                        { label: 'New Today', value: data?.todayRegistrations ?? 0, color: '#D4A574' },
                        { label: 'Activated Today', value: data?.todayActivations ?? 0, color: '#10b981' },
                        { label: 'Pending Approval', value: data?.pendingUsers ?? 0, color: '#f59e0b' },
                        {
                            label: 'Active Rate',
                            value: data && data.totalUsers > 0 ? `${((data.activeUsers / data.totalUsers) * 100).toFixed(1)}%` : '0%',
                            color: '#C4956A',
                        },
                    ].map(item => (
                        <div key={item.label} style={{ borderLeft: `2px solid ${item.color}30`, paddingLeft: '0.75rem' }}>
                            <div style={{ fontSize: '0.63rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '0.4rem' }}>{item.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color, fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                                {loading ? '—' : item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
