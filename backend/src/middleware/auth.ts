import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
    user?: any;
}

// Protect routes - require authentication
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token: string | undefined;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true, uniqueId: true, status: true },
        });

        if (!user) {
            res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Not authorized, token invalid' });
    }
};

// Admin only middleware
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ status: 'error', message: 'Admin access only' });
    }
};

// Require ACTIVE status — blocks PENDING users from all activity except dashboard/profile
export const requireActive = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Admins bypass this check
    if (req.user?.role === 'ADMIN') { next(); return; }

    // PENDING users get blocked with a clear message
    if (req.user?.status !== 'ACTIVE') {
        res.status(403).json({
            status: 'error',
            code: 'ACCOUNT_PENDING',
            message: 'Your account is pending activation. Please wait for admin approval.',
        });
        return;
    }
    next();
};
