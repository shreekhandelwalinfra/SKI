import prisma from '../config/database';

async function cleanupData() {
    console.log('🧹 Cleaning up data (keeping users & admin logins)...\n');

    // 1. Delete all profits
    const profits = await prisma.profit.deleteMany({});
    console.log(`  ✅ Deleted ${profits.count} profit records`);

    // 2. Delete all rewards
    const rewards = await prisma.reward.deleteMany({});
    console.log(`  ✅ Deleted ${rewards.count} reward records`);

    // 3. Delete all installments
    const installments = await prisma.installment.deleteMany({});
    console.log(`  ✅ Deleted ${installments.count} installment records`);

    // 4. Delete all property deals
    const deals = await prisma.propertyDeal.deleteMany({});
    console.log(`  ✅ Deleted ${deals.count} property deal records`);

    // 5. Delete all investments
    const investments = await prisma.investment.deleteMany({});
    console.log(`  ✅ Deleted ${investments.count} investment records`);

    // 6. Reset all users' bonus/rank fields to 0 (keep login info intact)
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
    console.log(`  ✅ Reset bonus/rank fields for ${users.count} users`);

    console.log('\n✅ Cleanup complete! All users & admin logins preserved.');
    await prisma.$disconnect();
}

cleanupData().catch(e => { console.error('❌ Cleanup failed:', e); prisma.$disconnect(); process.exit(1); });
