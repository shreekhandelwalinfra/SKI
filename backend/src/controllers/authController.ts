import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendVerificationEmail } from '../services/emailService';

// ─── TOKEN HELPERS ───────────────────────────────────────────

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    } as jwt.SignOptions);
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = generateToken(user.id);

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
    };

    res.status(statusCode).cookie('token', token, options).json({
        status: 'success',
        data: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.toLowerCase(),
            uniqueId: user.uniqueId,
            referralCode: user.referralCode,
            status: user.status ? user.status.toLowerCase() : undefined,
        },
    });
};

// ─── HELPERS ────────────────────────────────────────────────

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

// Generate a 6-digit numeric OTP string
const generateOTP = (): string => String(Math.floor(100000 + Math.random() * 900000));

// ─── REGISTER ────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, referralCode } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Account exists but not verified — route them to OTP screen (don't resend email here)
            if (!existingUser.isEmailVerified) {
                res.status(400).json({
                    status: 'error',
                    message: 'Account already exists but email is not verified. Please use the OTP sent to your email, or request a new one.',
                    unverified: true,
                    email,
                });
                return;
            }
            res.status(400).json({ status: 'error', message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const uniqueId = await generateUniqueId();
        const newReferralCode = generateReferralCode();

        let referredById: string | null = null;
        let teamLeadId: string | null = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({ where: { referralCode: referralCode.toUpperCase() } });
            if (referrer) {
                referredById = referrer.id;
                teamLeadId = referrer.id;
            }
        }

        // Generate OTP — valid for 10 minutes
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save user as UNVERIFIED — no JWT yet
        await prisma.user.create({
            data: {
                name, email, password: hashedPassword, phone: phone || '',
                uniqueId, referralCode: newReferralCode,
                referredById, teamLeadId,
                isEmailVerified: false,
                emailOTP: otp,
                emailOTPExpiresAt: otpExpiry,
                emailOTPSentAt: new Date(),
                emailOTPAttempts: 1,
            },
        });

        await sendVerificationEmail(email, otp, name);

        res.status(201).json({
            status: 'success',
            message: 'Registration successful! Please check your email for the 6-digit verification code.',
            email,
        });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Registration failed' });
    }
};

// ─── VERIFY EMAIL ────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({ status: 'error', message: 'Email and OTP are required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.emailOTP || !user.emailOTPExpiresAt) {
            res.status(400).json({ status: 'error', message: 'Invalid or expired verification code.' });
            return;
        }

        if (new Date() > user.emailOTPExpiresAt) {
            res.status(400).json({ status: 'error', message: 'Verification code has expired. Please request a new one.' });
            return;
        }

        if (user.emailOTP !== otp.toString().trim()) {
            res.status(400).json({ status: 'error', message: 'Incorrect verification code. Please try again.' });
            return;
        }

        // OTP correct — mark as verified and clear OTP fields
        const verifiedUser = await prisma.user.update({
            where: { email },
            data: {
                isEmailVerified: true,
                emailOTP: null,
                emailOTPExpiresAt: null,
                emailOTPSentAt: null,
                emailOTPAttempts: 0,
            },
        });

        sendTokenResponse(verifiedUser, 200, res);
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: 'Verification failed. Please try again.' });
    }
};

// ─── RESEND VERIFICATION ─────────────────────────────────────

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ status: 'error', message: 'Email is required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal if user exists
            res.status(200).json({ status: 'success', message: 'If that email is registered, a new code has been sent.' });
            return;
        }

        if (user.isEmailVerified) {
            res.status(400).json({ status: 'error', message: 'This email is already verified.' });
            return;
        }

        // 60-second cooldown
        if (user.emailOTPSentAt) {
            const secondsSinceLastSend = (Date.now() - user.emailOTPSentAt.getTime()) / 1000;
            if (secondsSinceLastSend < 60) {
                const waitSeconds = Math.ceil(60 - secondsSinceLastSend);
                res.status(429).json({
                    status: 'error',
                    message: `Please wait ${waitSeconds} seconds before requesting another code.`,
                    waitSeconds,
                });
                return;
            }
        }

        // Max 3 OTP sends per account
        if (user.emailOTPAttempts >= 3) {
            res.status(429).json({
                status: 'error',
                message: 'Maximum verification attempts reached. Please contact support or try again tomorrow.',
            });
            return;
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                emailOTP: otp,
                emailOTPExpiresAt: otpExpiry,
                emailOTPSentAt: new Date(),
                emailOTPAttempts: { increment: 1 },
            },
        });

        await sendVerificationEmail(email, otp, user.name);

        res.status(200).json({ status: 'success', message: 'A fresh verification code has been sent to your email.' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: 'Failed to resend verification email.' });
    }
};

// ─── LOGIN ───────────────────────────────────────────────────

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

        // Block unverified users — with flag so frontend shows OTP screen
        if (!user.isEmailVerified) {
            res.status(403).json({
                status: 'error',
                message: 'Please verify your email before logging in.',
                unverified: true,
                email,
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Login failed' });
    }
};

// ─── GET ME ──────────────────────────────────────────────────

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

// ─── LOGOUT ─────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success', data: {} });
};
