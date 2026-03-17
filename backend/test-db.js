/**
 * Check OTP fields for users in the database
 */
const { PrismaClient } = require('./node_modules/@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: { isEmailVerified: false },
        select: {
            id: true,
            email: true,
            isEmailVerified: true,
            emailOTP: true,
            emailOTPExpiresAt: true,
            emailOTPSentAt: true,
            emailOTPAttempts: true,
        },
    });

    console.log(`Found ${users.length} unverified users:\n`);
    users.forEach(u => {
        console.log(`Email: ${u.email}`);
        console.log(`  isEmailVerified : ${u.isEmailVerified}`);
        console.log(`  emailOTP        : ${u.emailOTP}`);
        console.log(`  emailOTPExpires : ${u.emailOTPExpiresAt}`);
        console.log(`  emailOTPSentAt  : ${u.emailOTPSentAt}`);
        console.log(`  emailOTPAttempts: ${u.emailOTPAttempts}`);
        console.log('');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
