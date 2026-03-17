import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { processInstallment } from '../../services/compensationEngine';
import { emitInvestmentUpdate, emitProfitUpdate } from '../../config/socket';
import { notifyUser, notifyAdmin } from '../../services/notificationService';
import { logAdminAction } from '../../services/adminLogService';

// ─── INVESTMENTS ─────────────────────────────────────────

/** List all investments with optional status filter and pagination */
export const getInvestments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const where: any = {};
        if (status) where.status = (status as string).toUpperCase();

        const [investments, total] = await Promise.all([
            prisma.investment.findMany({
                where,
                include: { user: { select: { name: true, uniqueId: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (+page - 1) * +limit, take: +limit,
            }),
            prisma.investment.count({ where }),
        ]);

        res.status(200).json({
            status: 'success', data: investments,
            pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get investments' });
    }
};

/** Approve or reject an investment, triggering compensation cascade on approval */
export const updateInvestmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, remarks } = req.body;
        const newStatus = status.toUpperCase();

        const investment = await prisma.investment.findUnique({
            where: { id: req.params.id },
            include: { user: true },
        });
        if (!investment) {
            res.status(404).json({ status: 'error', message: 'Investment not found' });
            return;
        }

        if (investment.status === 'APPROVED' && newStatus === 'APPROVED') {
            res.status(400).json({ status: 'error', message: 'Investment already approved' });
            return;
        }

        const updated = await prisma.investment.update({
            where: { id: req.params.id },
            data: { status: newStatus, remarks: remarks || '' },
        });

        // ──── COMPENSATION CASCADE (only on APPROVED) ────
        if (newStatus === 'APPROVED') {
            const user = investment.user;

            let propertyDeal = null;

            if ((investment as any).propertyDealId) {
                propertyDeal = await prisma.propertyDeal.findUnique({
                    where: { id: (investment as any).propertyDealId }
                });
            }

            if (!propertyDeal) {
                const rawPropName = (investment.propertyName || investment.name || '').trim();
                const rawUnitNumber = ((investment as any).unitNumber || '').trim();

                const userDeals = await prisma.propertyDeal.findMany({ where: { userId: user.id } });
                propertyDeal = userDeals.find(
                    (d: any) => d.propertyName.trim().toLowerCase() === rawPropName.toLowerCase() &&
                        (d as any).unitNumber.trim().toLowerCase() === rawUnitNumber.toLowerCase()
                ) || null;

                if (!propertyDeal) {
                    propertyDeal = await prisma.propertyDeal.create({
                        data: {
                            userId: user.id,
                            propertyName: rawPropName,
                            unitNumber: rawUnitNumber,
                            propertyType: investment.type || '',
                            totalDealAmount: investment.propertyValue || investment.amount,
                        } as any,
                    });
                }

                await prisma.investment.update({
                    where: { id: investment.id },
                    data: { propertyDealId: propertyDeal.id } as any
                });
            }

            try {
                const result = await processInstallment(
                    user.id,
                    propertyDeal.id,
                    investment.amount,
                );
                console.log(`✅ Compensation cascade for ${user.uniqueId}: Direct Bonus ₹${result.directBonus.toLocaleString('en-IN')}, New Rank: ${result.newRank} `);
            } catch (compError: any) {
                console.error(`⚠️ Compensation cascade error for investment ${investment.id}: `, compError.message);
            }
        }

        emitInvestmentUpdate();
        try {
            await emitProfitUpdate(investment.userId);
        } catch (e) {
            console.error("Socket emit failed", e)
        }

        const statusMsg = newStatus === 'APPROVED'
            ? `Your ₹${investment.amount.toLocaleString('en-IN')} investment for ${investment.propertyName || 'property'} has been approved! ✅`
            : `Your ₹${investment.amount.toLocaleString('en-IN')} investment for ${investment.propertyName || 'property'} was rejected.`;
        await notifyUser({
            userId: investment.userId,
            type: 'INVESTMENT',
            title: newStatus === 'APPROVED' ? 'Investment Approved! ✅' : 'Investment Rejected ❌',
            message: statusMsg,
            link: '/user/investments',
        });

        await notifyAdmin({
            type: 'INVESTMENT',
            title: `Investment ${newStatus} `,
            message: `${investment.user.name} (${investment.user.uniqueId}) - ₹${investment.amount.toLocaleString('en-IN')} ${newStatus.toLowerCase()} `,
            link: '/admin/investments',
        });

        await logAdminAction({
            adminId: req.user!.id,
            action: newStatus === 'APPROVED' ? 'APPROVE_INVESTMENT' : 'REJECT_INVESTMENT',
            targetId: investment.id,
            targetName: `${investment.user.name} - ${investment.propertyName || 'investment'} `,
            details: JSON.stringify({ investmentId: investment.id, amount: investment.amount, status: newStatus, remarks }),
        });

        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update investment' });
    }
};
