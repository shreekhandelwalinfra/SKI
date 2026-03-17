import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── DASHBOARD ───────────────────────────────────────────

/** Returns aggregated dashboard statistics for the admin panel */
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers, activeUsers, pendingUsers,
            todayRegistrations, todayActivations,
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
            prisma.user.count({ where: { role: 'USER', status: 'PENDING' } }),
            prisma.user.count({ where: { role: 'USER', createdAt: { gte: today } } }),
            prisma.user.count({ where: { role: 'USER', activatedAt: { gte: today } } }),
        ]);

        const userAggs = await prisma.user.aggregate({
            where: { role: 'USER' },
            _sum: {
                totalBusiness: true,
                selfReward: true,
                directBonus: true,
                teamBonus: true,
            }
        });

        const [totalDeals, pendingInvestments] = await Promise.all([
            prisma.propertyDeal.count(),
            prisma.investment.count({ where: { status: 'PENDING' } }),
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalUsers, activeUsers, pendingUsers,
                todayRegistrations, todayActivations,
                totalBusiness: userAggs._sum.totalBusiness || 0,
                totalSelfReward: userAggs._sum.selfReward || 0,
                totalDirectBonus: userAggs._sum.directBonus || 0,
                totalTeamBonus: userAggs._sum.teamBonus || 0,
                totalDeals, pendingInvestments,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get dashboard stats' });
    }
};
