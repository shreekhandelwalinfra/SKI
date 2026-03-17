import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── PROFIT ──────────────────────────────────────────────

/** Get self reward profit with rank eligibility calculations */
export const getSelfReward = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { rank: true, selfReward: true, selfInvestment: true, totalBusiness: true, teamBonus: true, directBonus: true },
        });
        const allRanks = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });

        // Calculate volume rank (first rank where totalBusiness <= max)
        let volumeRank = 0;
        for (const tier of allRanks) {
            if (user!.totalBusiness <= tier.teamBusinessMax) {
                volumeRank = tier.rank;
                break;
            }
        }
        if (!volumeRank && allRanks.length) volumeRank = allRanks[allRanks.length - 1].rank;

        // Calculate investment rank (highest rank where selfInvestment >= threshold)
        let investmentRank = 0;
        for (const tier of allRanks) {
            if (user!.selfInvestment >= tier.selfInvestment) {
                investmentRank = tier.rank;
            }
        }

        const eligibleRank = Math.min(volumeRank, investmentRank);
        const bottleneck = volumeRank < investmentRank ? 'Team Business' : investmentRank < volumeRank ? 'Investment' : 'Equal';

        const eligibleRankConfig = allRanks.find(r => r.rank === eligibleRank) || null;
        const nextRankConfig = allRanks.find(r => r.rank === eligibleRank + 1) || null;

        const profits = await prisma.profit.findMany({
            where: { userId: req.user?.id, type: 'SELF_REWARD' },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            status: 'success',
            data: {
                user,
                rankConfig: eligibleRankConfig,
                allRanks,
                volumeRank,
                investmentRank,
                eligibleRank,
                bottleneck,
                nextRankConfig,
                profits,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get self reward' });
    }
};

/** Get team bonus profit entries */
export const getTeamBonusProfit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const profits = await prisma.profit.findMany({
            where: { userId: req.user?.id, type: 'TEAM_BONUS' },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: profits });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get team bonus' });
    }
};

/** Get direct bonus profit entries */
export const getDirectBonusProfit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const profits = await prisma.profit.findMany({
            where: { userId: req.user?.id, type: 'DIRECT_BONUS' },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: profits });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get direct bonus' });
    }
};
