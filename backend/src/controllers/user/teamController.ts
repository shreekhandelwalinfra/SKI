import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── MY TEAM (Nested Tree Structure) ─────────────────────

/** Get the user's referral tree in a nested structure */
export const getMyTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const maxDepth = Math.min(Number(req.query.depth) || 10, 10);

        const currentUser = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, name: true, uniqueId: true, rank: true,
                referredBy: { select: { id: true, name: true, uniqueId: true, email: true, phone: true } },
            },
        });

        async function buildTree(parentId: string, level: number): Promise<any[]> {
            if (level > maxDepth) return [];
            const members = await prisma.user.findMany({
                where: { referredById: parentId },
                select: {
                    id: true, name: true, email: true, uniqueId: true, phone: true,
                    selfInvestment: true, totalBusiness: true, rank: true,
                    status: true, createdAt: true,
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
                    level, downlineCount: m._count.referrals, children,
                });
            }
            return nodes;
        }

        const tree = await buildTree(req.user!.id, 1);
        const countAll = (nodes: any[]): number => nodes.reduce((s, n) => s + 1 + countAll(n.children), 0);

        res.status(200).json({
            status: 'success',
            data: tree,
            total: countAll(tree),
            referredBy: currentUser?.referredBy || null,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get team' });
    }
};
