import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── PROFIT & REWARDS ────────────────────────────────────

/** Get all rewards (admin view) */
export const getRewards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.query;
        const where: any = {};
        if (userId) where.userId = userId;

        const rewards = await prisma.reward.findMany({
            where,
            include: {
                user: { select: { name: true, uniqueId: true, rank: true } },
            },
            orderBy: { claimedAt: 'desc' },
        });

        res.status(200).json({ status: 'success', data: rewards });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get rewards' });
    }
};

/** Get firm-level profit entries */
export const getFirmProfit = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const profits = await prisma.profit.findMany({
            where: { type: 'FIRM' },
            include: { user: { select: { name: true, uniqueId: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: profits });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get firm profits' });
    }
};

/** Get team bonus breakdown by team leads */
export const getTeamBonus = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teamLeads = await prisma.user.findMany({
            where: { role: 'USER', status: 'ACTIVE' },
            select: { id: true, name: true, uniqueId: true, teamBonus: true },
        });

        const teamBonusData = [];
        for (const lead of teamLeads) {
            const members = await prisma.user.findMany({
                where: { teamLeadId: lead.id },
                select: { id: true, name: true, uniqueId: true, teamBonus: true, directBonus: true, selfReward: true, totalBusiness: true },
            });

            if (members.length > 0 || lead.teamBonus > 0) {
                teamBonusData.push({ teamLead: lead, members });
            }
        }

        res.status(200).json({ status: 'success', data: teamBonusData });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get team bonus' });
    }
};

/** Get user income summary with pagination */
export const getUserIncome = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: { role: 'USER' },
                select: { id: true, name: true, uniqueId: true, selfReward: true, directBonus: true, teamBonus: true, totalBusiness: true, rank: true, selfInvestment: true },
                orderBy: { totalBusiness: 'desc' },
                skip: (+page - 1) * +limit, take: +limit,
            }),
            prisma.user.count({ where: { role: 'USER' } }),
        ]);

        const data = users.map(u => ({
            ...u,
            totalIncome: u.selfReward + u.directBonus + u.teamBonus,
        }));

        res.status(200).json({
            status: 'success', data,
            pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get user income' });
    }
};
