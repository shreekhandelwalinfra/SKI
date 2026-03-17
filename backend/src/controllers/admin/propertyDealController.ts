import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { processInstallment } from '../../services/compensationEngine';

// ─── PROPERTY DEALS ──────────────────────────────────────

/** List property deals with user info and installments */
export const getPropertyDeals = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, userId } = req.query;
        const where: any = {};
        if (userId) where.userId = userId;

        const [deals, total] = await Promise.all([
            prisma.propertyDeal.findMany({
                where,
                include: {
                    user: { select: { name: true, uniqueId: true, email: true } },
                    installments: { orderBy: { processedAt: 'asc' } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (+page - 1) * +limit, take: +limit,
            }),
            prisma.propertyDeal.count({ where }),
        ]);

        res.status(200).json({
            status: 'success', data: deals,
            pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get property deals' });
    }
};

/** Admin creates a property deal for a user */
export const createPropertyDeal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId, propertyName, propertyType, totalDealAmount } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const deal = await prisma.propertyDeal.create({
            data: {
                userId,
                propertyName,
                propertyType: propertyType || '',
                totalDealAmount: Number(totalDealAmount),
            },
            include: {
                user: { select: { name: true, uniqueId: true } },
            },
        });

        res.status(201).json({ status: 'success', data: deal });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create property deal' });
    }
};

/**
 * Admin records a new installment on a property deal.
 * Triggers the ENTIRE compensation cascade:
 *   selfInvestment++ → rank recalc → direct bonus → team bonus → rewards
 */
export const addInstallment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount } = req.body;
        const dealId = req.params.id;

        const deal = await prisma.propertyDeal.findUnique({
            where: { id: dealId },
            select: { userId: true },
        });
        if (!deal) { res.status(404).json({ status: 'error', message: 'Property deal not found' }); return; }

        const result = await processInstallment(deal.userId, dealId, Number(amount));

        const updatedDeal = await prisma.propertyDeal.findUnique({
            where: { id: dealId },
            include: {
                user: { select: { name: true, uniqueId: true, rank: true, selfInvestment: true, totalBusiness: true } },
                installments: { orderBy: { processedAt: 'asc' } },
            },
        });

        res.status(200).json({
            status: 'success',
            data: updatedDeal,
            compensation: {
                directBonusPaid: result.directBonus,
                newRank: result.newRank,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to add installment' });
    }
};
