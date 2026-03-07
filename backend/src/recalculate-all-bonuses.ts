/**
 * ─── RECALCULATE ALL BONUSES SCRIPT ─────────────────────────
 *
 * This script recalculates ALL users' ranks, direct bonuses, and
 * team bonuses using the CURRENT rank configuration from the database.
 *
 * Use this after updating rank tiers (seedRankConfig) to ensure
 * every profit record reflects the corrected commission percentages.
 *
 * Steps:
 *   1. Load current rank tiers from DB
 *   2. Recalculate every user's rank (volume + investment)
 *   3. Recalculate every DIRECT_BONUS profit record at the correct rate
 *   4. Recalculate every TEAM_BONUS profit record at the correct differential rate
 *   5. Recalculate every user's aggregate directBonus and teamBonus totals
 */

import prisma from './config/database';

// ─── RANK HELPERS ────────────────────────────────────────────

interface RankTier {
    rank: number;
    teamBusinessMax: number;
    commissionPct: number;
    selfInvestment: number;
}

let rankTiers: RankTier[] = [];

async function loadRankTiers() {
    const configs = await prisma.rankConfig.findMany({ orderBy: { rank: 'asc' } });
    rankTiers = configs.map(c => ({
        rank: c.rank,
        teamBusinessMax: c.teamBusinessMax,
        commissionPct: c.commissionPct,
        selfInvestment: c.selfInvestment,
    }));
    console.log('\n📊 Loaded Rank Tiers:');
    rankTiers.forEach(t => console.log(`   Rank ${t.rank}: ${t.commissionPct}%  (max business: ₹${t.teamBusinessMax.toLocaleString('en-IN')})`));
    console.log('');
}

function getRankForBusiness(totalBusiness: number): number {
    for (const tier of rankTiers) {
        if (totalBusiness <= tier.teamBusinessMax) return tier.rank;
    }
    return rankTiers.length > 0 ? rankTiers[rankTiers.length - 1].rank : 0;
}

function getRateForRank(rank: number): number {
    const tier = rankTiers.find(t => t.rank === rank);
    return tier ? tier.commissionPct / 100 : 0;
}

// ─── STEP 1: RECALCULATE ALL USER RANKS ─────────────────────

async function recalcAllUserRanks() {
    console.log('═══════════════════════════════════════');
    console.log('  STEP 1: Recalculating User Ranks');
    console.log('═══════════════════════════════════════\n');

    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, name: true, uniqueId: true, totalBusiness: true, rank: true },
    });

    let changed = 0;
    for (const user of users) {
        const newRank = getRankForBusiness(user.totalBusiness);
        if (newRank !== user.rank) {
            await prisma.user.update({
                where: { id: user.id },
                data: { rank: newRank },
            });
            console.log(`   ✅ ${user.name} (${user.uniqueId}): Rank ${user.rank} → ${newRank}  (business: ₹${user.totalBusiness.toLocaleString('en-IN')})`);
            changed++;
        } else {
            console.log(`   ── ${user.name} (${user.uniqueId}): Rank ${user.rank} unchanged`);
        }
    }
    console.log(`\n   📝 ${changed} user(s) had rank changes out of ${users.length} total.\n`);
}

// ─── STEP 2: RECALCULATE ALL DIRECT BONUS PROFITS ──────────

async function recalcAllDirectBonuses() {
    console.log('═══════════════════════════════════════');
    console.log('  STEP 2: Recalculating Direct Bonuses');
    console.log('═══════════════════════════════════════\n');

    // Get all property deals with their installments
    const deals = await prisma.propertyDeal.findMany({
        include: {
            installments: { orderBy: { processedAt: 'asc' } },
            user: { select: { id: true, name: true, uniqueId: true, rank: true } },
        },
    });

    let totalRecalculated = 0;

    for (const deal of deals) {
        const user = deal.user;
        const currentRate = getRateForRank(user.rank);

        // Recalculate each installment's direct bonus using True-Up formula
        let cumulativeInstallments = 0;
        let cumulativeDirectBonusPaid = 0;

        for (const inst of deal.installments) {
            cumulativeInstallments += inst.amount;

            // True-Up: what SHOULD have been earned total so far at new rate
            const totalEarnedSoFar = cumulativeInstallments * currentRate;
            // What should THIS installment pay = totalEarned - what was already paid before
            const correctDirectBonus = Math.max(0, totalEarnedSoFar - cumulativeDirectBonusPaid);

            const oldBonus = inst.directBonusPaid;
            const oldRate = inst.rateAtPayment;

            if (Math.abs(correctDirectBonus - oldBonus) > 0.01 || Math.abs(currentRate - oldRate) > 0.001) {
                // Update the installment record
                await prisma.installment.update({
                    where: { id: inst.id },
                    data: {
                        rateAtPayment: currentRate,
                        directBonusPaid: correctDirectBonus,
                    },
                });

                // Update the corresponding DIRECT_BONUS profit record
                await prisma.profit.updateMany({
                    where: {
                        userId: user.id,
                        type: 'DIRECT_BONUS',
                        transactionId: inst.transactionId,
                    },
                    data: {
                        amount: correctDirectBonus,
                        brokerage: currentRate * 100,
                        commission: correctDirectBonus,
                        remark: `Installment ₹${inst.amount.toLocaleString('en-IN')} @ ${(currentRate * 100).toFixed(1)}% (True-up applied)`,
                    },
                });

                console.log(`   ✅ ${user.name} | ${deal.propertyName} | Installment ₹${inst.amount.toLocaleString('en-IN')}`);
                console.log(`      Rate: ${(oldRate * 100).toFixed(1)}% → ${(currentRate * 100).toFixed(1)}% | Bonus: ₹${oldBonus.toLocaleString('en-IN')} → ₹${correctDirectBonus.toLocaleString('en-IN')}`);
                totalRecalculated++;
            }

            cumulativeDirectBonusPaid += correctDirectBonus;
        }
    }

    console.log(`\n   📝 ${totalRecalculated} installment(s) recalculated.\n`);
}

// ─── STEP 3: RECALCULATE ALL TEAM BONUS PROFITS ────────────

async function recalcAllTeamBonuses() {
    console.log('═══════════════════════════════════════');
    console.log('  STEP 3: Recalculating Team Bonuses');
    console.log('═══════════════════════════════════════\n');

    // Get all team bonus profits
    const teamProfits = await prisma.profit.findMany({
        where: { type: 'TEAM_BONUS' },
        orderBy: { createdAt: 'asc' },
    });

    let totalRecalculated = 0;

    // Group team bonuses by (upline userId, propertyDealId, fromUserId)
    // so we can recalculate the differential correctly
    const groupedMap = new Map<string, typeof teamProfits>();
    for (const tp of teamProfits) {
        const key = `${tp.userId}|${tp.propertyDealId}|${tp.fromUserId}`;
        if (!groupedMap.has(key)) groupedMap.set(key, []);
        groupedMap.get(key)!.push(tp);
    }

    for (const [key, profits] of groupedMap) {
        const [uplineUserId, propertyDealId, fromUserId] = key.split('|');
        if (!propertyDealId || !fromUserId) continue;

        // Get upline's current rank/rate
        const upline = await prisma.user.findUnique({
            where: { id: uplineUserId },
            select: { id: true, name: true, uniqueId: true, rank: true },
        });
        if (!upline) continue;

        // Get the triggering user's current rank/rate
        const fromUser = await prisma.user.findUnique({
            where: { id: fromUserId },
            select: { id: true, name: true, rank: true },
        });
        if (!fromUser) continue;

        const uplineRate = getRateForRank(upline.rank);
        const fromUserRate = getRateForRank(fromUser.rank);

        // The differential rate
        const differentialRate = Math.max(0, uplineRate - fromUserRate);

        // Get total deal installments
        const deal = await prisma.propertyDeal.findUnique({
            where: { id: propertyDealId },
            include: { installments: true },
        });
        if (!deal) continue;

        const totalDealInstallments = deal.installments.reduce((sum, inst) => sum + inst.amount, 0);

        // Total team bonus this upline SHOULD earn from this deal's triggering user
        const correctTotalTeamBonus = totalDealInstallments * differentialRate;

        // The existing total paid
        const existingTotal = profits.reduce((sum, p) => sum + p.amount, 0);

        if (Math.abs(correctTotalTeamBonus - existingTotal) > 0.01) {
            // Distribute the correct total across the existing profit records proportionally
            // If there's only one record, just set it directly
            if (profits.length === 1) {
                const p = profits[0];
                await prisma.profit.update({
                    where: { id: p.id },
                    data: {
                        amount: correctTotalTeamBonus,
                        differencePercentage: differentialRate * 100,
                        remark: `Differential: ${(differentialRate * 100).toFixed(1)}% on deal (True-up applied)`,
                    },
                });
            } else {
                // Multiple records: redistribute proportionally
                for (let i = 0; i < profits.length; i++) {
                    const p = profits[i];
                    const proportion = existingTotal > 0 ? p.amount / existingTotal : 1 / profits.length;
                    const newAmount = correctTotalTeamBonus * proportion;

                    await prisma.profit.update({
                        where: { id: p.id },
                        data: {
                            amount: newAmount,
                            differencePercentage: differentialRate * 100,
                            remark: `Differential: ${(differentialRate * 100).toFixed(1)}% on deal (True-up applied)`,
                        },
                    });
                }
            }

            console.log(`   ✅ ${upline.name} (${upline.uniqueId}) ← from ${fromUser.name}`);
            console.log(`      Differential: ${(differentialRate * 100).toFixed(1)}% | Total: ₹${existingTotal.toLocaleString('en-IN')} → ₹${correctTotalTeamBonus.toLocaleString('en-IN')}`);
            totalRecalculated++;
        }
    }

    console.log(`\n   📝 ${totalRecalculated} team bonus group(s) recalculated.\n`);
}

// ─── STEP 4: RECALCULATE USER AGGREGATE TOTALS ─────────────

async function recalcUserAggregates() {
    console.log('═══════════════════════════════════════');
    console.log('  STEP 4: Recalculating User Aggregates');
    console.log('═══════════════════════════════════════\n');

    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, name: true, uniqueId: true, directBonus: true, teamBonus: true },
    });

    for (const user of users) {
        // Sum all DIRECT_BONUS profits for this user
        const directSum = await prisma.profit.aggregate({
            where: { userId: user.id, type: 'DIRECT_BONUS', status: { in: ['APPROVED', 'PAID'] } },
            _sum: { amount: true },
        });

        // Sum all TEAM_BONUS profits for this user
        const teamSum = await prisma.profit.aggregate({
            where: { userId: user.id, type: 'TEAM_BONUS', status: { in: ['APPROVED', 'PAID'] } },
            _sum: { amount: true },
        });

        const newDirectBonus = directSum._sum.amount || 0;
        const newTeamBonus = teamSum._sum.amount || 0;

        const directChanged = Math.abs(newDirectBonus - user.directBonus) > 0.01;
        const teamChanged = Math.abs(newTeamBonus - user.teamBonus) > 0.01;

        if (directChanged || teamChanged) {
            await prisma.user.update({
                where: { id: user.id },
                data: { directBonus: newDirectBonus, teamBonus: newTeamBonus },
            });
            console.log(`   ✅ ${user.name} (${user.uniqueId}):`);
            if (directChanged) console.log(`      Direct Bonus: ₹${user.directBonus.toLocaleString('en-IN')} → ₹${newDirectBonus.toLocaleString('en-IN')}`);
            if (teamChanged) console.log(`      Team Bonus:   ₹${user.teamBonus.toLocaleString('en-IN')} → ₹${newTeamBonus.toLocaleString('en-IN')}`);
        } else {
            console.log(`   ── ${user.name} (${user.uniqueId}): No aggregate changes`);
        }
    }
    console.log('');
}

// ─── MAIN ───────────────────────────────────────────────────

async function main() {
    console.log('\n🔄 ═══════════════════════════════════════════════════');
    console.log('   FULL BONUS RECALCULATION SCRIPT');
    console.log('   Using current RankConfig from database');
    console.log('═══════════════════════════════════════════════════════\n');

    await loadRankTiers();
    await recalcAllUserRanks();
    await recalcAllDirectBonuses();
    await recalcAllTeamBonuses();
    await recalcUserAggregates();

    console.log('═══════════════════════════════════════');
    console.log('  ✅ ALL DONE — Recalculation complete!');
    console.log('═══════════════════════════════════════\n');

    await prisma.$disconnect();
}

main().catch(e => {
    console.error('❌ Recalculation failed:', e);
    prisma.$disconnect();
    process.exit(1);
});
