'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getDashboardStats, cleanupData } from '../lib/api';

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

const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: '👥', color: '#6366f1' },
    { key: 'activeUsers', label: 'Active Users', icon: '✅', color: '#22c55e' },
    { key: 'pendingUsers', label: 'Pending Users', icon: '⏳', color: '#f59e0b' },
    { key: 'todayRegistrations', label: "Today's Registration", icon: '📝', color: '#06b6d4' },
    { key: 'todayActivations', label: "Today's Activated", icon: '🎯', color: '#8b5cf6' },
    { key: 'totalBusiness', label: 'Total Business', icon: '💼', color: '#C4956A', isCurrency: true },
    { key: 'totalSelfReward', label: 'Total Self Reward', icon: '🏆', color: '#ec4899', isCurrency: true },
    { key: 'totalDirectBonus', label: 'Total Direct Bonus', icon: '💎', color: '#14b8a6', isCurrency: true },
    { key: 'totalTeamBonus', label: 'Total Team Bonus', icon: '🤝', color: '#f97316', isCurrency: true },
];

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCleaning, setIsCleaning] = useState(false);

    const loadStats = async () => {
        try {
            const res = await getDashboardStats();
            setData(res.data);
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStats(); }, []);

    // Real-time: refresh dashboard when investments change
    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
        socket.on('investment:updated', loadStats);
        return () => { socket.disconnect(); };
    }, []);

    const formatValue = (value: number, isCurrency?: boolean) => {
        if (isCurrency) {
            if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
            if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
            return `₹${value.toLocaleString('en-IN')}`;
        }
        return value.toLocaleString('en-IN');
    };

    const handleCleanup = async () => {
        if (!window.confirm("Are you sure you want to cleanup system data? This will delete all investments, profits, rewards, deals, and installments.\n\nAdmin and user accounts will be kept. This action CANNOT be undone.")) return;

        try {
            setIsCleaning(true);
            const res = await cleanupData();
            alert(res.message || "System data cleaned up successfully!");
            await loadStats();
        } catch (err: any) {
            console.error('Cleanup failed:', err);
            alert(err.message || 'Failed to cleanup system data');
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <div>
            {/* Header section with title and button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Dashboard Overview</h1>
                <button
                    onClick={handleCleanup}
                    disabled={isCleaning || loading}
                    className="px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 hover:bg-red-500/20"
                    style={{
                        background: isCleaning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        opacity: (isCleaning || loading) ? 0.7 : 1,
                        cursor: (isCleaning || loading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isCleaning ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#ef4444', borderTopColor: 'transparent' }}></span>
                            Cleaning...
                        </>
                    ) : (
                        <>
                            <span>🧹</span> Cleanup Data
                        </>
                    )}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {statCards.map(card => (
                    <div
                        key={card.key}
                        className="p-5 rounded-lg transition-all"
                        style={{
                            background: '#1A1A24',
                            border: '1px solid #2E2E3E',
                        }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{card.icon}</span>
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: card.color }}
                            />
                        </div>

                        {loading ? (
                            <div className="h-8 rounded" style={{ background: '#22222E', animation: 'pulse 1.5s infinite' }} />
                        ) : (
                            <div className="text-2xl font-bold mb-1" style={{ color: '#F5F0EB' }}>
                                {data ? formatValue((data as any)[card.key], card.isCurrency) : '0'}
                            </div>
                        )}

                        <div className="text-xs uppercase tracking-wider" style={{ color: '#8A8A96', letterSpacing: '0.1em' }}>
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Info Bar */}
            <div
                className="mt-6 p-5 rounded-lg"
                style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}
            >
                <h3 className="text-sm font-medium mb-3 tracking-wider" style={{ color: '#C4956A', letterSpacing: '0.1em' }}>
                    QUICK OVERVIEW
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-xs mb-1" style={{ color: '#8A8A96' }}>Users Today</div>
                        <div className="text-lg font-semibold" style={{ color: '#F5F0EB' }}>
                            {data?.todayRegistrations || 0}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs mb-1" style={{ color: '#8A8A96' }}>Activated Today</div>
                        <div className="text-lg font-semibold" style={{ color: '#22c55e' }}>
                            {data?.todayActivations || 0}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs mb-1" style={{ color: '#8A8A96' }}>Pending Approval</div>
                        <div className="text-lg font-semibold" style={{ color: '#f59e0b' }}>
                            {data?.pendingUsers || 0}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs mb-1" style={{ color: '#8A8A96' }}>Active Rate</div>
                        <div className="text-lg font-semibold" style={{ color: '#C4956A' }}>
                            {data && data.totalUsers > 0
                                ? `${((data.activeUsers / data.totalUsers) * 100).toFixed(1)}%`
                                : '0%'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
