import prisma from './config/database';

const RANK_TIERS = [
    { rank: 1, teamBusinessMin: 0, teamBusinessMax: 499999, commissionPct: 5, selfInvestment: 500000, rewardName: 'Mobile', rewardValue: 5000 },
    { rank: 2, teamBusinessMin: 500000, teamBusinessMax: 2499999, commissionPct: 7, selfInvestment: 750000, rewardName: 'LED TV', rewardValue: 20000 },
    { rank: 3, teamBusinessMin: 2500000, teamBusinessMax: 4999999, commissionPct: 9, selfInvestment: 1000000, rewardName: 'Motorbike', rewardValue: 50000 },
    { rank: 4, teamBusinessMin: 5000000, teamBusinessMax: 9999999, commissionPct: 11, selfInvestment: 2500000, rewardName: 'Car', rewardValue: 300000 },
    { rank: 5, teamBusinessMin: 10000000, teamBusinessMax: 49999999, commissionPct: 13, selfInvestment: 3500000, rewardName: 'Swift Car', rewardValue: 500000 },
    { rank: 6, teamBusinessMin: 50000000, teamBusinessMax: 99999999, commissionPct: 14, selfInvestment: 5000000, rewardName: 'Scorpio', rewardValue: 1000000 },
    { rank: 7, teamBusinessMin: 100000000, teamBusinessMax: 249999999, commissionPct: 15, selfInvestment: 10000000, rewardName: 'Fortuner', rewardValue: 2500000 },
    { rank: 8, teamBusinessMin: 250000000, teamBusinessMax: 499999999, commissionPct: 16, selfInvestment: 25000000, rewardName: 'BMW', rewardValue: 5000000 },
    { rank: 9, teamBusinessMin: 500000000, teamBusinessMax: 749999999, commissionPct: 17, selfInvestment: 50000000, rewardName: 'Apartment', rewardValue: 7500000 },
    { rank: 10, teamBusinessMin: 750000000, teamBusinessMax: 999999999, commissionPct: 18, selfInvestment: 100000000, rewardName: 'Villa', rewardValue: 10000000 },
];

async function seedRankConfig() {
    console.log('🏗️ Seeding Rank Configuration...\n');

    for (const tier of RANK_TIERS) {
        await prisma.rankConfig.upsert({
            where: { rank: tier.rank },
            update: tier,
            create: tier,
        });
        console.log(`  ✅ Rank ${tier.rank}: ${tier.rewardName} (${tier.commissionPct}%, max business ₹${tier.teamBusinessMax.toLocaleString('en-IN')})`);
    }

    console.log('\n✅ All 10 rank tiers seeded successfully!');
    await prisma.$disconnect();
}

seedRankConfig().catch(e => { console.error('❌ Seed failed:', e); prisma.$disconnect(); process.exit(1); });
