import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { processInstallment, recalcRankBottomUp, evaluateRewards } from '../services/compensationEngine';
import { emitInvestmentUpdate } from '../config/socket';

// ─── DASHBOARD ───────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers, activeUsers, pendingUsers,
            todayRegistrations, todayActivations,
            businessAgg, selfRewardAgg, directBonusAgg, teamBonusAgg,
            totalDeals, pendingInvestments,
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
            prisma.user.count({ where: { role: 'USER', status: 'PENDING' } }),
            prisma.user.count({ where: { role: 'USER', createdAt: { gte: today } } }),
            prisma.user.count({ where: { role: 'USER', activatedAt: { gte: today } } }),
            prisma.user.aggregate({ where: { role: 'USER' }, _sum: { totalBusiness: true } }),
            prisma.user.aggregate({ where: { role: 'USER' }, _sum: { selfReward: true } }),
            prisma.user.aggregate({ where: { role: 'USER' }, _sum: { directBonus: true } }),
            prisma.user.aggregate({ where: { role: 'USER' }, _sum: { teamBonus: true } }),
            prisma.propertyDeal.count(),
            prisma.investment.count({ where: { status: 'PENDING' } }),
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalUsers, activeUsers, pendingUsers,
                todayRegistrations, todayActivations,
                totalBusiness: businessAgg._sum.totalBusiness || 0,
                totalSelfReward: selfRewardAgg._sum.selfReward || 0,
                totalDirectBonus: directBonusAgg._sum.directBonus || 0,
                totalTeamBonus: teamBonusAgg._sum.teamBonus || 0,
                totalDeals, pendingInvestments,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get dashboard stats' });
    }
};

// ─── USERS ───────────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const where: any = { role: 'USER' };

        if (status) where.status = (status as string).toUpperCase();
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
                { uniqueId: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    referredBy: { select: { name: true, uniqueId: true } },
                    teamLead: { select: { name: true, uniqueId: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (+page - 1) * +limit, take: +limit,
            }),
            prisma.user.count({ where }),
        ]);

        const data = users.map(({ password, ...u }) => u);

        res.status(200).json({
            status: 'success', data,
            pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get users' });
    }
};

export const addUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, status, referredBy, teamLeadId } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) { res.status(400).json({ status: 'error', message: 'User with this email already exists' }); return; }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password || 'default123', salt);
        const count = await prisma.user.count();
        const uniqueId = `SKI-${String(count + 1).padStart(5, '0')}`;

        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword, phone: phone || '', uniqueId,
                status: status === 'active' ? 'ACTIVE' : 'PENDING',
                referredById: referredBy || null,
                teamLeadId: teamLeadId || null,
                activatedAt: status === 'active' ? new Date() : null,
            },
        });

        const { password: _, ...userData } = user;
        res.status(201).json({ status: 'success', data: userData });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to add user' });
    }
};

export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: 'ACTIVE', activatedAt: new Date() },
        });
        res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to activate user' });
    }
};

export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { isBlocked: !user.isBlocked, status: !user.isBlocked ? 'BLOCKED' : 'ACTIVE' },
        });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to block/unblock user' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.status(200).json({ status: 'success', message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to delete user' });
    }
};

export const getAdminUserTree = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const maxDepth = Math.min(Number(req.query.depth) || 10, 10);

        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, name: true, uniqueId: true, email: true, phone: true,
                selfReward: true, directBonus: true, teamBonus: true, totalBusiness: true,
                selfInvestment: true, isBlocked: true, status: true, createdAt: true, rank: true
            }
        });
        if (!targetUser) {
            res.status(404).json({ status: 'error', message: 'User not found' });
            return;
        }

        async function buildTree(parentId: string, level: number): Promise<any[]> {
            if (level > maxDepth) return [];
            const members = await prisma.user.findMany({
                where: { referredById: parentId },
                select: {
                    id: true, name: true, email: true, uniqueId: true, phone: true,
                    selfInvestment: true, totalBusiness: true, rank: true,
                    status: true, createdAt: true,
                    selfReward: true, directBonus: true, teamBonus: true, isBlocked: true,
                    _count: { select: { referrals: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            const nodes = [];
            for (const m of members) {
                const children = m._count.referrals > 0 ? await buildTree(m.id, level + 1) : [];
                nodes.push({
                    id: m.id, name: m.name, email: m.email, phone: m.phone,
                    uniqueId: m.uniqueId,
                    selfInvestment: m.selfInvestment, totalBusiness: m.totalBusiness,
                    rank: m.rank, status: m.status, createdAt: m.createdAt,
                    selfReward: m.selfReward, directBonus: m.directBonus, teamBonus: m.teamBonus, isBlocked: m.isBlocked,
                    level, downlineCount: m._count.referrals, children,
                });
            }
            return nodes;
        }

        const tree = await buildTree(id, 1);
        const countAll = (nodes: any[]): number => nodes.reduce((s, n) => s + 1 + countAll(n.children), 0);

        res.status(200).json({
            status: 'success',
            data: tree,
            total: countAll(tree),
            targetUser
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get user tree' });
    }
};

export const updateUserBalances = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { selfReward, directBonus, teamBonus, totalBusiness, selfInvestment } = req.body;

        const updateData: any = {};
        if (typeof selfReward === 'number') updateData.selfReward = selfReward;
        if (typeof directBonus === 'number') updateData.directBonus = directBonus;
        if (typeof teamBonus === 'number') updateData.teamBonus = teamBonus;
        if (typeof totalBusiness === 'number') updateData.totalBusiness = totalBusiness;
        if (typeof selfInvestment === 'number') updateData.selfInvestment = selfInvestment;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ status: 'error', message: 'No valid fields provided for update' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, selfReward: true, directBonus: true, teamBonus: true, totalBusiness: true, selfInvestment: true }
        });

        res.status(200).json({ status: 'success', message: 'User balances updated', data: updatedUser });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update user balances' });
    }
};

// ─── INVESTMENTS ─────────────────────────────────────────
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

export const updateInvestmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, remarks } = req.body;
        const newStatus = status.toUpperCase();

        // Fetch the investment with user info
        const investment = await prisma.investment.findUnique({
            where: { id: req.params.id },
            include: { user: true },
        });
        if (!investment) {
            res.status(404).json({ status: 'error', message: 'Investment not found' });
            return;
        }

        // Prevent re-processing already approved investments
        if (investment.status === 'APPROVED' && newStatus === 'APPROVED') {
            res.status(400).json({ status: 'error', message: 'Investment already approved' });
            return;
        }

        // Update investment status
        const updated = await prisma.investment.update({
            where: { id: req.params.id },
            data: { status: newStatus, remarks: remarks || '' },
        });

        // ──── COMPENSATION CASCADE (only on APPROVED) ────
        if (newStatus === 'APPROVED') {
            const user = investment.user;

            // 1. Find or create a PropertyDeal for this user + property
            //    Trim and normalize the property name to avoid duplicate deals
            const rawPropName = (investment.propertyName || investment.name || '').trim();

            // Search all user's deals and match by trimmed+lowercased name
            const userDeals = await prisma.propertyDeal.findMany({ where: { userId: user.id } });
            let propertyDeal = userDeals.find(
                d => d.propertyName.trim().toLowerCase() === rawPropName.toLowerCase()
            ) || null;

            if (!propertyDeal) {
                propertyDeal = await prisma.propertyDeal.create({
                    data: {
                        userId: user.id,
                        propertyName: rawPropName,
                        propertyType: investment.type || '',
                        totalDealAmount: investment.propertyValue || investment.amount,
                    },
                });
            }

            // 2. Run the compensation engine
            //    processInstallment handles:
            //      - selfInvestment update
            //      - Rank recalculation bottom-up (Phase A)
            //      - Direct Bonus with True-Up
            //      - Team Bonus differential pass-up (Phase B)
            //      - Physical Rewards evaluation (MIN bottleneck)
            try {
                const result = await processInstallment(
                    user.id,
                    propertyDeal.id,
                    investment.amount,
                );
                console.log(`✅ Compensation cascade for ${user.uniqueId}: Direct Bonus ₹${result.directBonus.toLocaleString('en-IN')}, New Rank: ${result.newRank}`);
            } catch (compError: any) {
                console.error(`⚠️ Compensation cascade error for investment ${investment.id}:`, compError.message);
                // Don't fail the approval — the investment is already approved, log the error
            }
        }

        emitInvestmentUpdate(); // Real-time push to all clients
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update investment' });
    }
};

// ─── PROPERTY DEALS ──────────────────────────────────────

/** Get all property deals with installments */
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
 * This triggers the ENTIRE compensation cascade:
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

        // Trigger the compensation engine
        const result = await processInstallment(deal.userId, dealId, Number(amount));

        // Fetch updated deal with installments
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

// ─── REWARDS ─────────────────────────────────────────────

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

// ─── PROFIT ──────────────────────────────────────────────
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

// ─── SUPPORT ─────────────────────────────────────────────
export const getSupportTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.query;
        const where: any = {};
        if (status) where.status = (status as string).toUpperCase().replace(' ', '_');

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: { user: { select: { name: true, uniqueId: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: tickets });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get support tickets' });
    }
};

export const updateSupportTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, adminReply } = req.body;
        const ticket = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { status: status.toUpperCase().replace(' ', '_'), adminReply: adminReply || '' },
        });
        res.status(200).json({ status: 'success', data: ticket });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update ticket' });
    }
};

// ─── CHANGE PASSWORD ─────────────────────────────────────
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

// ─── SYSTEM CLEANUP ──────────────────────────────────────
export const cleanupDataHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 1. Delete all profits
        const profits = await prisma.profit.deleteMany({});

        // 2. Delete all rewards
        const rewards = await prisma.reward.deleteMany({});

        // 3. Delete all installments
        const installments = await prisma.installment.deleteMany({});

        // 4. Delete all property deals
        const deals = await prisma.propertyDeal.deleteMany({});

        // 5. Delete all investments
        const investments = await prisma.investment.deleteMany({});

        // 6. Reset all users' bonus/rank fields to 0
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
