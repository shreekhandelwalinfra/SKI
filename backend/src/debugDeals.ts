import prisma from './config/database';

async function debugDeals() {
    const deals = await prisma.propertyDeal.findMany({
        include: {
            installments: { orderBy: { processedAt: 'asc' } },
            user: { select: { name: true, uniqueId: true } },
        },
    });

    for (const deal of deals) {
        console.log(`\n=== Deal: ${deal.propertyName} | User: ${deal.user.name} (${deal.user.uniqueId}) ===`);
        console.log(`  Deal ID: ${deal.id}`);
        console.log(`  Total Deal Amount: ${deal.totalDealAmount}`);
        console.log(`  Installments (${deal.installments.length}):`);
        for (const inst of deal.installments) {
            console.log(`    - Amount: ${inst.amount}, Rate: ${inst.rateAtPayment}, DirectBonusPaid: ${inst.directBonusPaid}, TXN: ${inst.transactionId}`);
        }
    }

    const profits = await prisma.profit.findMany({
        include: { user: { select: { name: true, uniqueId: true } } },
        orderBy: { createdAt: 'asc' },
    });

    console.log(`\n\n=== ALL PROFITS ===`);
    for (const p of profits) {
        console.log(`  ${p.user.name} | ${p.type} | Amount: ${p.amount} | Investment: ${p.investmentAmount} | Brokerage: ${p.brokerage}% | Remark: ${p.remark}`);
    }

    await prisma.$disconnect();
}

debugDeals();
