import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { emitInvestmentUpdate } from '../../config/socket';
import { notifyAdmin } from '../../services/notificationService';

// ─── INVESTMENTS & PROPERTY DEALS ────────────────────────

/** Get the user's own investments */
export const getUserInvestments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const investments = await prisma.investment.findMany({
            where: { userId: req.user?.id },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: investments });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get investments' });
    }
};

/** User submits a new investment */
export const createInvestment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const { propertyName, unitNumber, propertyDealId, plotAreaSize, propertyValue, propertyAddress, amount, installmentNo } = req.body;

        if (!propertyDealId && propertyName && unitNumber) {
            const existingDeal = await prisma.propertyDeal.findFirst({
                where: {
                    userId: user.id,
                    propertyName: { equals: propertyName, mode: 'insensitive' },
                    unitNumber: { equals: unitNumber, mode: 'insensitive' }
                }
            });
            if (existingDeal) {
                res.status(400).json({ status: 'error', message: 'You already own this property. Please go back and select "Pay Installment" for this existing project.' });
                return;
            }
        }

        const investment = await prisma.investment.create({
            data: {
                userId: user.id,
                name: user.name,
                uniqueId: user.uniqueId,
                amount: Number(amount),
                propertyName: propertyName || '',
                unitNumber: unitNumber || '',
                propertyDealId: propertyDealId || null,
                plotAreaSize: plotAreaSize || '',
                propertyValue: Number(propertyValue) || 0,
                propertyAddress: propertyAddress || '',
                installmentNo: installmentNo || '1',
                type: `${propertyName || 'Existing Property'} - Installment ${installmentNo}`,
                transactionDate: new Date(),
                transactionId: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            },
        });

        res.status(201).json({ status: 'success', data: investment });
        emitInvestmentUpdate();

        await notifyAdmin({
            type: 'INVESTMENT',
            title: 'New Investment Submitted 💰',
            message: `${user.name} (${user.uniqueId}) submitted ₹${Number(amount).toLocaleString('en-IN')} for ${propertyName || 'property'}`,
            link: '/admin/investments',
        });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create investment' });
    }
};

/** Get user's property deals with installment summaries */
export const getUserPropertyDeals = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const deals = await prisma.propertyDeal.findMany({
            where: { userId: req.user?.id },
            include: {
                installments: { orderBy: { processedAt: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const data = deals.map(deal => ({
            ...deal,
            totalPaid: deal.installments.reduce((sum, i) => sum + i.amount, 0),
            totalBonusEarned: deal.installments.reduce((sum, i) => sum + i.directBonusPaid, 0),
            installmentCount: deal.installments.length,
        }));

        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get property deals' });
    }
};

/** Get user's rewards with eligibility status */
export const getUserRewards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const claimedRewards = await prisma.reward.findMany({
            where: { userId: req.user?.id },
            orderBy: { rank: 'asc' },
        });

        const allRanks = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });

        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { totalBusiness: true, selfInvestment: true, rank: true },
        });

        const claimedRankSet = new Set(claimedRewards.map(r => r.rank));

        const rewardStatus = allRanks.map(rc => ({
            rank: rc.rank,
            rewardName: rc.rewardName,
            rewardValue: rc.rewardValue,
            requiredBusiness: rc.teamBusinessMax,
            requiredInvestment: rc.selfInvestment,
            claimed: claimedRankSet.has(rc.rank),
            claimedAt: claimedRewards.find(r => r.rank === rc.rank)?.claimedAt || null,
        }));

        res.status(200).json({
            status: 'success',
            data: {
                rewards: rewardStatus,
                userRank: user?.rank || 0,
                totalBusiness: user?.totalBusiness || 0,
                selfInvestment: user?.selfInvestment || 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get rewards' });
    }
};
