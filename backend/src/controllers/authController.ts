import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    } as jwt.SignOptions);
};

// Auto-generate unique ID
const generateUniqueId = async (): Promise<string> => {
    const count = await prisma.user.count();
    return `SKI-${String(count + 1).padStart(5, '0')}`;
};

// Auto-generate referral code
const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SKI';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, referralCode } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ status: 'error', message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const uniqueId = await generateUniqueId();
        const newReferralCode = generateReferralCode();

        // Find referrer if referral code provided
        let referredById: string | null = null;
        let teamLeadId: string | null = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({ where: { referralCode: referralCode.toUpperCase() } });
            if (referrer) {
                referredById = referrer.id;
                teamLeadId = referrer.id;
            }
        }

        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword, phone: phone || '',
                uniqueId, referralCode: newReferralCode,
                referredById, teamLeadId,
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase(),
                uniqueId: user.uniqueId,
                referralCode: user.referralCode,
                token: generateToken(user.id),
            },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Registration failed' });
    }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ status: 'error', message: 'Your account has been blocked. Contact support.' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase(),
                uniqueId: user.uniqueId,
                referralCode: user.referralCode,
                status: user.status.toLowerCase(),
                token: generateToken(user.id),
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Login failed' });
    }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                id: true, name: true, email: true, phone: true, role: true,
                uniqueId: true, referralCode: true, status: true, rank: true,
                selfReward: true, directBonus: true, teamBonus: true,
                totalBusiness: true, selfInvestment: true, createdAt: true,
            },
        });
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to get user' });
    }
};
