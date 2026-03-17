import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── DASHBOARD ───────────────────────────────────────────

/** Returns the user's dashboard with rank info, referral link, and aggregated stats */
export const getUserDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                id: true, name: true, uniqueId: true, referralCode: true,
                selfReward: true, directBonus: true, teamBonus: true,
                totalBusiness: true, selfInvestment: true, downlineVolume: true,
                rank: true, status: true,
            },
        });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const rankConfig = await prisma.rankConfig.findUnique({ where: { rank: user.rank || 1 } });
        const allRanks = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });
        const directTeamSize = await prisma.user.count({ where: { referredById: user.id } });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const referralLink = `${frontendUrl}/user/signup?ref=${user.referralCode}`;

        let volumeRank = 0;
        let investmentRank = 0;
        for (const rc of allRanks) {
            if (user.totalBusiness <= rc.teamBusinessMax) {
                volumeRank = volumeRank || rc.rank;
            }
            if (user.selfInvestment >= rc.selfInvestment) {
                investmentRank = rc.rank;
            }
        }
        if (!volumeRank && allRanks.length > 0) volumeRank = allRanks[allRanks.length - 1].rank;

        const claimedRewards = await prisma.reward.count({ where: { userId: user.id } });
        const eligibleRank = Math.min(volumeRank, investmentRank);

        res.status(200).json({
            status: 'success',
            data: {
                ...user,
                referralLink,
                directTeamSize,
                rankConfig,
                allRanks,
                volumeRank,
                investmentRank,
                eligibleRewardRank: eligibleRank,
                claimedRewards,
                totalIncome: user.selfReward + user.directBonus + user.teamBonus,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get dashboard' });
    }
};
