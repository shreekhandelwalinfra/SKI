import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { emitInvestmentUpdate, getIO } from '../config/socket';

// ─── DASHBOARD ───────────────────────────────────────────
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

        // Get rank config for current rank
        const rankConfig = await prisma.rankConfig.findUnique({ where: { rank: user.rank || 1 } });

        // Get ALL rank configs for display
        const allRanks = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });

        // Get team size (direct referrals)
        const directTeamSize = await prisma.user.count({ where: { referredById: user.id } });

        // Build referral link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const referralLink = `${frontendUrl}/user/signup?ref=${user.referralCode}`;

        // Get volume rank and investment rank for reward eligibility display
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

        // Pending rewards count
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

// ─── MY TEAM (Nested Tree Structure) ─────────────────────
export const getMyTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const maxDepth = Math.min(Number(req.query.depth) || 10, 10);

        // Get current user with referrer info
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, name: true, uniqueId: true, rank: true,
                referredBy: { select: { id: true, name: true, uniqueId: true, email: true, phone: true } },
            },
        });

        // Recursive: build nested tree
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

// ─── PROPERTY DEALS ──────────────────────────────────────
export const getUserPropertyDeals = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const deals = await prisma.propertyDeal.findMany({
            where: { userId: req.user?.id },
            include: {
                installments: { orderBy: { processedAt: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate totals
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

// ─── REWARDS ─────────────────────────────────────────────
export const getUserRewards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get claimed rewards
        const claimedRewards = await prisma.reward.findMany({
            where: { userId: req.user?.id },
            orderBy: { rank: 'asc' },
        });

        // Get all rank configs for showing what's available
        const allRanks = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });

        // Get user's current eligibility
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { totalBusiness: true, selfInvestment: true, rank: true },
        });

        const claimedRankSet = new Set(claimedRewards.map(r => r.rank));

        // Build full reward status list
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

// ─── INVESTMENTS ─────────────────────────────────────────
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

export const createInvestment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const { propertyName, plotAreaSize, propertyValue, propertyAddress, amount, installmentNo } = req.body;
        const investment = await prisma.investment.create({
            data: {
                userId: user.id,
                name: user.name,
                uniqueId: user.uniqueId,
                amount: Number(amount),
                propertyName: propertyName || '',
                plotAreaSize: plotAreaSize || '',
                propertyValue: Number(propertyValue) || 0,
                propertyAddress: propertyAddress || '',
                installmentNo: installmentNo || '1',
                type: `${propertyName} - Installment ${installmentNo}`,
                transactionDate: new Date(),
                transactionId: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            },
        });

        res.status(201).json({ status: 'success', data: investment });
        emitInvestmentUpdate(); // Real-time push to admin
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create investment' });
    }
};

// ─── SUPPORT ─────────────────────────────────────────────
export const getUserTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user?.id },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: tickets });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get tickets' });
    }
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const { subject, message } = req.body;
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                subject, message,
                messages: [{ sender: 'user', text: message, time: new Date().toISOString() }],
            },
        });
        getIO()?.emit('support:updated', { action: 'create', ticket });
        res.status(201).json({ status: 'success', data: ticket });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create ticket' });
    }
};

export const replyToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticket = await prisma.supportTicket.findFirst({
            where: { id: req.params.id, userId: req.user?.id },
        });
        if (!ticket) { res.status(404).json({ status: 'error', message: 'Ticket not found' }); return; }

        const existingMessages = (ticket.messages as any[]) || [];
        existingMessages.push({ sender: 'user', text: req.body.message, time: new Date().toISOString() });

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { messages: existingMessages },
        });
        getIO()?.emit('support:updated', { action: 'update', ticket: updated });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to reply' });
    }
};

export const markTicketSeenByUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticket = await prisma.supportTicket.findFirst({
            where: { id: req.params.id, userId: req.user?.id },
        });
        if (!ticket) { res.status(404).json({ status: 'error', message: 'Ticket not found' }); return; }

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: {
                // @ts-ignore
                lastSeenByUser: new Date()
            },
        });
        getIO()?.emit('support:updated', { action: 'update', ticket: updated });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark ticket as seen' });
    }
};

// ─── PROFIT ──────────────────────────────────────────────
export const getSelfReward = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { rank: true, selfReward: true, selfInvestment: true, totalBusiness: true, teamBonus: true, directBonus: true },
        });
        const allRanks = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });

        // Calculate separate ranks
        let volumeRank = 0;
        let investmentRank = 0;
        for (const rc of allRanks) {
            if (user!.totalBusiness >= rc.teamBusinessMax) {
                // Wait, logic is totalBusiness <= maxTeamBusiness in engine:
                // Actually the engine says: if (totalTeamBusiness <= tier.maxTeamBusiness) { return tier.rank }
                // So volume rank is the FIRST rank where totalBusiness <= max. 
                // Let me just copy engine logic:
            }
        }

        let engineVolRank = 0;
        for (const tier of allRanks) {
            if (user!.totalBusiness <= tier.teamBusinessMax) {
                engineVolRank = tier.rank;
                break;
            }
        }
        if (!engineVolRank && allRanks.length) engineVolRank = allRanks[allRanks.length - 1].rank;
        volumeRank = engineVolRank;

        let engineInvRank = 0;
        for (const tier of allRanks) {
            if (user!.selfInvestment >= tier.selfInvestment) {
                engineInvRank = tier.rank;
            }
        }
        investmentRank = engineInvRank;

        const eligibleRank = Math.min(volumeRank, investmentRank);
        const bottleneck = volumeRank < investmentRank ? 'Team Business' : investmentRank < volumeRank ? 'Investment' : 'Equal';

        // Current eligible rank config
        const eligibleRankConfig = allRanks.find(r => r.rank === eligibleRank) || null;
        // Next rank config
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

// ─── PROFILE ─────────────────────────────────────────────
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                id: true, name: true, email: true, phone: true, uniqueId: true,
                referralCode: true, address: true, city: true, state: true,
                pincode: true, panNumber: true, aadharNumber: true, profileImage: true,
                dateOfBirth: true, status: true, rank: true, createdAt: true,
                bankDetail: true,
            },
        });
        res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, phone, address, city, state, pincode, panNumber, aadharNumber, dateOfBirth, profileImage } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user?.id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(pincode !== undefined && { pincode }),
                ...(panNumber !== undefined && { panNumber }),
                ...(aadharNumber !== undefined && { aadharNumber }),
                ...(dateOfBirth !== undefined && { dateOfBirth }),
                ...(profileImage !== undefined && { profileImage }),
            },
        });

        const { password: _, ...userData } = user;
        res.status(200).json({ status: 'success', data: userData });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to update profile' });
    }
};

export const changeUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { res.status(400).json({ status: 'error', message: 'Current password is incorrect' }); return; }

        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(newPassword, salt);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

        res.status(200).json({ status: 'success', message: 'Password changed successfully' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to change password' });
    }
};

export const updateBankDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { accountHolder, accountNumber, ifscCode, bankName, branchName, upiId } = req.body;

        const bankDetail = await prisma.bankDetail.upsert({
            where: { userId: req.user?.id },
            create: {
                userId: req.user!.id,
                accountHolder: accountHolder || '',
                accountNumber: accountNumber || '',
                ifscCode: ifscCode || '',
                bankName: bankName || '',
                branchName: branchName || '',
                upiId: upiId || '',
            },
            update: {
                ...(accountHolder !== undefined && { accountHolder }),
                ...(accountNumber !== undefined && { accountNumber }),
                ...(ifscCode !== undefined && { ifscCode }),
                ...(bankName !== undefined && { bankName }),
                ...(branchName !== undefined && { branchName }),
                ...(upiId !== undefined && { upiId }),
            },
        });
        res.status(200).json({ status: 'success', data: bankDetail });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to update bank details' });
    }
};
