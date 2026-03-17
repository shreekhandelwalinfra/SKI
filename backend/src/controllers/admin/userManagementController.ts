import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { broadcastSocketEvent } from '../../config/socket';
import { notifyUser } from '../../services/notificationService';
import { logAdminAction } from '../../services/adminLogService';

// ─── USERS ───────────────────────────────────────────────

/** List users with optional status filter, search, and pagination */
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

/** Admin creates a new user */
export const addUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, status, referredBy, teamLeadId } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) { res.status(400).json({ status: 'error', message: 'User with this email already exists' }); return; }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password || 'default123', salt);
        const count = await prisma.user.count();
        const uniqueId = `SKI - ${String(count + 1).padStart(5, '0')} `;

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

/** Activate a pending user */
export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: 'ACTIVE', activatedAt: new Date() },
        });

        await notifyUser({
            userId: user.id,
            type: 'SYSTEM',
            title: 'Account Activated! 🎉',
            message: 'Welcome to SKI! Your account has been activated. You can now submit investments and build your team.',
            link: '/user/dashboard',
        });

        await logAdminAction({
            adminId: req.user!.id,
            action: 'ACTIVATE_USER',
            targetId: user.id,
            targetName: user.name,
            details: JSON.stringify({ userId: user.id, uniqueId: user.uniqueId }),
        });

        broadcastSocketEvent('user:updated', { action: 'activate', userId: user.id });

        res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to activate user' });
    }
};

/** Toggle block/unblock status for a user */
export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { isBlocked: !user.isBlocked, status: !user.isBlocked ? 'BLOCKED' : 'ACTIVE' },
        });

        await logAdminAction({
            adminId: req.user!.id,
            action: !user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
            targetId: user.id,
            targetName: user.name,
            details: JSON.stringify({ userId: user.id, uniqueId: user.uniqueId }),
        });

        broadcastSocketEvent('user:updated', { action: 'block_status_change', userId: user.id });

        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to block/unblock user' });
    }
};

/** Permanently delete a user */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.status(200).json({ status: 'success', message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to delete user' });
    }
};

/** Get the nested referral tree for a specific user */
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

/** Admin updates user balance fields manually */
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
