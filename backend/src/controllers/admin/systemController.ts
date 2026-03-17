import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── SYSTEM ──────────────────────────────────────────────

/** Admin changes their own password */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { res.status(400).json({ status: 'error', message: 'Current password is incorrect' }); return; }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

        res.status(200).json({ status: 'success', message: 'Password changed successfully' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to change password' });
    }
};

/** Wipe all financial data (profits, rewards, installments, deals, investments) and reset user balances */
export const cleanupDataHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const profits = await prisma.profit.deleteMany({});
        const rewards = await prisma.reward.deleteMany({});
        const installments = await prisma.installment.deleteMany({});
        const deals = await prisma.propertyDeal.deleteMany({});
        const investments = await prisma.investment.deleteMany({});

        const users = await prisma.user.updateMany({
            where: { role: 'USER' },
            data: {
                selfReward: 0,
                directBonus: 0,
                teamBonus: 0,
                totalBusiness: 0,
                selfInvestment: 0,
                downlineVolume: 0,
                rank: 0,
            },
        });

        res.status(200).json({
            status: 'success',
            message: 'System data partially cleaned. Users and admins preserved.',
            data: {
                deletedProfits: profits.count,
                deletedRewards: rewards.count,
                deletedInstallments: installments.count,
                deletedDeals: deals.count,
                deletedInvestments: investments.count,
                resetUsers: users.count
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to cleanup system data' });
    }
};
