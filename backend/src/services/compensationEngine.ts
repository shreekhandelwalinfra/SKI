/**
 * ─── MLM COMPENSATION ENGINE ─────────────────────────────────
 *
 * Core business logic for:
 *   1. Rank calculation (volume + investment)
 *   2. Direct Bonus with Installment True-Up (EXACT SPEC)
 *   3. Team Bonus with Differential Pass-Up + True-Up
 *   4. Physical Reward evaluation (MIN bottleneck + cumulative)
 */

import prisma from '../config/database';

// ─── RANK TIER TABLE ─────────────────────────────────────────

interface RankTier {
    rank: number;
    maxTeamBusiness: number;
    commissionPct: number;
    requiredSelfInvestment: number;
    rewardName: string;
    rewardValue: number;
}

let _rankTiers: RankTier[] | null = null;

async function loadRankTiers(): Promise<RankTier[]> {
    if (_rankTiers) return _rankTiers;
    const configs = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });
    _rankTiers = configs.map(c => ({
        rank: c.rank,
        maxTeamBusiness: c.teamBusinessMax,
        commissionPct: c.commissionPct,
        requiredSelfInvestment: c.selfInvestment,
        rewardName: c.rewardName,
        rewardValue: c.rewardValue,
    }));
    return _rankTiers;
}

/** Clear cached rank tiers (call after admin updates RankConfig) */
export function clearRankCache() {
    _rankTiers = null;
}

// ─── RANK LOOKUP FUNCTIONS ───────────────────────────────────

/**
 * Determine rank (1-10) based on Total Team Business using <= boundaries.
 * Returns 0 if no rank qualifies.
 */
export async function getRankForBusiness(totalTeamBusiness: number): Promise<number> {
    const tiers = await loadRankTiers();
    for (const tier of tiers) {
        if (totalTeamBusiness <= tier.maxTeamBusiness) {
            return tier.rank;
        }
    }
    // If business exceeds rank 10's max, they're rank 10
    return tiers.length > 0 ? tiers[tiers.length - 1].rank : 0;
}

/**
 * Determine rank (1-10) based on Self Investment using >= required thresholds.
 * Returns the highest rank whose required self-investment the user meets.
 */
export async function getRankForInvestment(selfInvestment: number): Promise<number> {
    const tiers = await loadRankTiers();
    let qualifiedRank = 0;
    for (const tier of tiers) {
        if (selfInvestment >= tier.requiredSelfInvestment) {
            qualifiedRank = tier.rank;
        }
    }
    return qualifiedRank;
}

/**
 * Get commission rate (as decimal, e.g. 0.05) for a given rank.
 */
export async function getRateForRank(rank: number): Promise<number> {
    const tiers = await loadRankTiers();
    const tier = tiers.find(t => t.rank === rank);
    return tier ? tier.commissionPct / 100 : 0;
}

// ─── TREE AGGREGATION ────────────────────────────────────────

/**
 * Recursively compute the total selfInvestment of ALL downline users
 * under a given userId (infinite depth).
 */
async function computeDownlineVolume(userId: string): Promise<number> {
    const directReferrals = await prisma.user.findMany({
        where: { referredById: userId, role: 'USER' },
        select: { id: true, selfInvestment: true },
    });

    let total = 0;
    for (const ref of directReferrals) {
        total += ref.selfInvestment;
        total += await computeDownlineVolume(ref.id);
    }
    return total;
}

/**
 * Phase A: Recalculate ranks from a given user UP to the root.
 * For EVERY ancestor, re-aggregates totalBusiness and updates rank.
 *
 * Returns the list of updated user IDs.
 */
export async function recalcRankBottomUp(startUserId: string): Promise<string[]> {
    const updatedIds: string[] = [];
    let currentId: string | null = startUserId;

    while (currentId) {
        const user: { id: string; selfInvestment: number; referredById: string | null } | null = await prisma.user.findUnique({
            where: { id: currentId },
            select: { id: true, selfInvestment: true, referredById: true },
        });
        if (!user) break;

        // Aggregate downline volume
        const downlineVolume = await computeDownlineVolume(user.id);
        const totalBusiness = user.selfInvestment + downlineVolume;

        // Determine new rank based on totalBusiness
        const newRank = await getRankForBusiness(totalBusiness);

        // Update the user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                downlineVolume,
                totalBusiness,
                rank: newRank,
            },
        });

        updatedIds.push(user.id);

        // Move up the tree
        currentId = user.referredById;
    }

    return updatedIds;
}

// ─── MODULE 1: DIRECT BONUS (Installment True-Up) ───────────

/**
 * Process a new installment on a property deal.
 * EXACT SPEC True-Up Formula:
 *
 *   Total_Earned_So_Far = Total_Installments_Received * Current_Rank_Rate
 *   Current_Installment_Payout = Total_Earned_So_Far - Total_Commission_Already_Paid
 *
 * Returns the direct bonus amount paid.
 */
export async function processInstallment(
    userId: string,
    propertyDealId: string,
    installmentAmount: number,
): Promise<{ directBonus: number; newRank: number }> {
    // 1. Get user and property deal
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, selfInvestment: true, uniqueId: true, name: true, rank: true, referredById: true },
    });
    if (!user) throw new Error('User not found');

    const deal = await prisma.propertyDeal.findUnique({
        where: { id: propertyDealId },
        include: { installments: { orderBy: { processedAt: 'asc' } } },
    });
    if (!deal) throw new Error('Property deal not found');
    if (deal.userId !== userId) throw new Error('Deal does not belong to this user');

    // 2. Update user's selfInvestment
    const newSelfInvestment = user.selfInvestment + installmentAmount;
    await prisma.user.update({
        where: { id: userId },
        data: { selfInvestment: newSelfInvestment },
    });

    // 3. Recalculate ranks bottom-up (Phase A)
    await recalcRankBottomUp(userId);

    // 4. Fetch updated user with new rank
    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { rank: true, totalBusiness: true },
    });
    const currentRate = await getRateForRank(updatedUser!.rank);

    // 5. EXACT SPEC True-Up Formula:
    //    Total installments received for this property (including the new one)
    const totalAllInstallments = deal.installments.reduce((sum, inst) => sum + inst.amount, 0) + installmentAmount;
    //    Total commission already paid for this property deal
    const totalCommissionAlreadyPaid = deal.installments.reduce((sum, inst) => sum + inst.directBonusPaid, 0);
    //    Formula:
    const totalEarnedSoFar = totalAllInstallments * currentRate;
    const directBonusAmount = Math.max(0, totalEarnedSoFar - totalCommissionAlreadyPaid);

    // 6. Record the installment
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    await prisma.installment.create({
        data: {
            propertyDealId,
            amount: installmentAmount,
            rateAtPayment: currentRate,
            directBonusPaid: directBonusAmount,
            transactionId: txnId,
        },
    });

    // 7. Create Direct Bonus profit record
    if (directBonusAmount > 0) {
        await prisma.profit.create({
            data: {
                userId,
                type: 'DIRECT_BONUS',
                amount: directBonusAmount,
                description: `Direct bonus on ${deal.propertyName} installment`,
                remark: `Installment ₹${installmentAmount.toLocaleString('en-IN')} @ ${(currentRate * 100).toFixed(1)}% (True-up applied)`,
                status: 'APPROVED',
                transactionId: txnId,
                investmentAmount: installmentAmount,
                brokerage: currentRate * 100,
                commission: directBonusAmount,
                propertyDealId,
            },
        });

        // Update user's directBonus aggregate
        await prisma.user.update({
            where: { id: userId },
            data: { directBonus: { increment: directBonusAmount } },
        });
    }

    // 8. Distribute Team Bonus to uplines (Phase B) with True-Up
    await distributeTeamBonus(userId, propertyDealId);

    // 9. Evaluate physical rewards
    await evaluateRewards(userId);

    return { directBonus: directBonusAmount, newRank: updatedUser!.rank };
}

// ─── MODULE 2: TEAM BONUS (Differential Pass-Up with True-Up) ─

/**
 * Phase B: Walk the upline tree and pay differential team bonuses.
 * Uses the SAME True-Up formula as direct bonus for each upline:
 *
 *   Upline_Total_Earned = Total_Installments * (Upline_Rate - Max_Rate_Already_Paid)
 *   Upline_Payout = Upline_Total_Earned - Upline_Commission_Already_Paid_For_This_Deal
 *
 * Rules:
 *   - Track maxRatePaidSoFar (starts at triggering user's rate)
 *   - "Same Rank Trap": if upline rate == triggering rate, skip
 *   - Stop at 17% or 10 levels max
 */
async function distributeTeamBonus(
    triggeringUserId: string,
    propertyDealId: string,
): Promise<void> {
    const triggeringUser = await prisma.user.findUnique({
        where: { id: triggeringUserId },
        select: { id: true, rank: true, name: true, uniqueId: true, referredById: true },
    });
    if (!triggeringUser || !triggeringUser.referredById) return;

    // Get total installments for this property deal (for true-up)
    const deal = await prisma.propertyDeal.findUnique({
        where: { id: propertyDealId },
        include: { installments: true },
    });
    if (!deal) return;
    const totalDealInstallments = deal.installments.reduce((sum, inst) => sum + inst.amount, 0);

    const triggeringRate = await getRateForRank(triggeringUser.rank);
    let maxRatePaidSoFar = triggeringRate;
    let currentUplineId: string | null = triggeringUser.referredById;
    let levelsTraversed = 0;
    const MAX_LEVELS = 10;
    const MAX_RATE = 0.17; // 17%

    while (currentUplineId && levelsTraversed < MAX_LEVELS && maxRatePaidSoFar < MAX_RATE) {
        levelsTraversed++;

        const upline: { id: string; rank: number; name: string; uniqueId: string; referredById: string | null; status: string } | null = await prisma.user.findUnique({
            where: { id: currentUplineId },
            select: { id: true, rank: true, name: true, uniqueId: true, referredById: true, status: true },
        });
        if (!upline || upline.status !== 'ACTIVE') {
            // Skip blocked/inactive uplines but continue traversal
            if (upline?.referredById) {
                currentUplineId = upline.referredById;
                continue;
            }
            break;
        }

        const uplineRate = await getRateForRank(upline.rank);

        if (uplineRate > maxRatePaidSoFar) {
            // Differential rate for this upline
            const differentialRate = uplineRate - maxRatePaidSoFar;

            // True-Up: Calculate what this upline SHOULD have earned total on this deal
            // then subtract what they've already been paid from past installments
            const uplineTotalEarned = totalDealInstallments * differentialRate;

            // Find what has already been paid to this upline for this deal
            const existingProfits = await prisma.profit.aggregate({
                where: {
                    userId: upline.id,
                    type: 'TEAM_BONUS',
                    propertyDealId,
                    fromUserId: triggeringUser.id,
                },
                _sum: { amount: true },
            });
            const alreadyPaid = existingProfits._sum.amount || 0;

            const teamBonusAmount = Math.max(0, uplineTotalEarned - alreadyPaid);

            if (teamBonusAmount > 0) {
                const txnId = `TB-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

                // Create Team Bonus profit record
                await prisma.profit.create({
                    data: {
                        userId: upline.id,
                        type: 'TEAM_BONUS',
                        amount: teamBonusAmount,
                        description: `Team bonus from ${triggeringUser.name}'s investment`,
                        remark: `Differential: ${(differentialRate * 100).toFixed(1)}% on deal (True-up applied)`,
                        status: 'APPROVED',
                        transactionId: txnId,
                        fromUserId: triggeringUser.id,
                        fromUserName: triggeringUser.name,
                        fromUserUniqueId: triggeringUser.uniqueId,
                        fromUserRank: triggeringUser.rank,
                        differencePercentage: differentialRate * 100,
                        investmentAmount: totalDealInstallments,
                        propertyDealId,
                    },
                });

                // Update upline's teamBonus aggregate
                await prisma.user.update({
                    where: { id: upline.id },
                    data: { teamBonus: { increment: teamBonusAmount } },
                });
            }

            maxRatePaidSoFar = uplineRate;
        }

        // Move up the tree
        currentUplineId = upline.referredById;
    }
}

// ─── MODULE 3: PHYSICAL REWARDS (MIN Bottleneck + Cumulative) ─

/**
 * Evaluate and grant cumulative physical rewards.
 *
 * Algorithm:
 *   1. volumeRank = rank based on totalTeamBusiness
 *   2. investmentRank = rank based on selfInvestment
 *   3. eligibleRank = MIN(volumeRank, investmentRank)
 *   4. Grant ALL unclaimed rewards from rank 1 to eligibleRank
 */
export async function evaluateRewards(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, totalBusiness: true, selfInvestment: true, selfReward: true },
    });
    if (!user) return;

    const tiers = await loadRankTiers();
    const volumeRank = await getRankForBusiness(user.totalBusiness);
    const investmentRank = await getRankForInvestment(user.selfInvestment);
    const eligibleRank = Math.min(volumeRank, investmentRank);

    if (eligibleRank <= 0) return;

    // Get already claimed rewards
    const claimedRewards = await prisma.reward.findMany({
        where: { userId },
        select: { rank: true },
    });
    const claimedRanks = new Set(claimedRewards.map(r => r.rank));

    // Grant all missing rewards from rank 1 to eligibleRank
    let totalRewardValue = 0;

    for (let r = 1; r <= eligibleRank; r++) {
        if (claimedRanks.has(r)) continue; // Already claimed

        const tier = tiers.find(t => t.rank === r);
        if (!tier) continue;

        // Create reward record
        await prisma.reward.create({
            data: {
                userId,
                rank: r,
                rewardName: tier.rewardName,
                rewardValue: tier.rewardValue,
            },
        });

        // Determine bottleneck
        const bottleneck = volumeRank < investmentRank ? 'Team Business' : investmentRank < volumeRank ? 'Investment' : 'Equal';

        // Create Self Reward profit record
        await prisma.profit.create({
            data: {
                userId,
                type: 'SELF_REWARD',
                amount: tier.rewardValue,
                description: `Rank ${r} reward: ${tier.rewardName}`,
                remark: `Rank ${r} — ${tier.rewardName} | Team Biz R${volumeRank}, Inv R${investmentRank} | Bottleneck: ${bottleneck}`,
                status: 'APPROVED',
                transactionId: `RWD-${Date.now()}-R${r}`,
                brokerage: r, // Store the reward rank for frontend display
            },
        });

        totalRewardValue += tier.rewardValue;
    }

    // Update user's selfReward aggregate
    if (totalRewardValue > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { selfReward: { increment: totalRewardValue } },
        });
    }
}
