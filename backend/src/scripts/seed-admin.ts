import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const seedAdmin = async () => {
    try {
        console.log('📦 Connecting to PostgreSQL...');

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@ski.com' } });
        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.email);
            await prisma.$disconnect();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@ski.com',
                password: hashedPassword,
                phone: '+91 9999999999',
                role: 'ADMIN',
                uniqueId: 'SKI-ADMIN',
                status: 'ACTIVE',
                activatedAt: new Date(),
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${admin.email}`);
        console.log('   Password: admin123');

        // Seed rank configuration
        const ranks = [
            { rank: 1, teamBusinessMin: 0, teamBusinessMax: 500000, commissionPct: 3, selfInvestment: 500000, rewardName: 'Mobile', rewardValue: 5000 },
            { rank: 2, teamBusinessMin: 500000, teamBusinessMax: 2500000, commissionPct: 5, selfInvestment: 750000, rewardName: 'LED TV', rewardValue: 20000 },
            { rank: 3, teamBusinessMin: 2500000, teamBusinessMax: 5000000, commissionPct: 7, selfInvestment: 1000000, rewardName: 'Motorbike', rewardValue: 50000 },
            { rank: 4, teamBusinessMin: 5000000, teamBusinessMax: 10000000, commissionPct: 9, selfInvestment: 2500000, rewardName: 'Car', rewardValue: 300000 },
            { rank: 5, teamBusinessMin: 10000000, teamBusinessMax: 50000000, commissionPct: 11, selfInvestment: 3500000, rewardName: 'Swift Car', rewardValue: 500000 },
            { rank: 6, teamBusinessMin: 50000000, teamBusinessMax: 100000000, commissionPct: 13, selfInvestment: 5000000, rewardName: 'Scorpio', rewardValue: 1000000 },
            { rank: 7, teamBusinessMin: 100000000, teamBusinessMax: 250000000, commissionPct: 14, selfInvestment: 10000000, rewardName: 'Fortuner', rewardValue: 2500000 },
            { rank: 8, teamBusinessMin: 250000000, teamBusinessMax: 500000000, commissionPct: 15, selfInvestment: 25000000, rewardName: 'BMW', rewardValue: 5000000 },
            { rank: 9, teamBusinessMin: 500000000, teamBusinessMax: 750000000, commissionPct: 16, selfInvestment: 50000000, rewardName: 'Apartment', rewardValue: 7500000 },
            { rank: 10, teamBusinessMin: 750000000, teamBusinessMax: 1000000000, commissionPct: 17, selfInvestment: 100000000, rewardName: 'Villa', rewardValue: 10000000 },
        ];

        await prisma.rankConfig.createMany({ data: ranks, skipDuplicates: true });
        console.log('✅ Rank configuration seeded (10 ranks)');

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

seedAdmin();
