import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

// ─── PROFILE ─────────────────────────────────────────────

/** Get the user's full profile */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                id: true, name: true, email: true, phone: true, uniqueId: true,
                referralCode: true, address: true, city: true, state: true,
                pincode: true, panNumber: true, aadharNumber: true, profileImage: true,
                dateOfBirth: true, status: true, rank: true, createdAt: true,
                bankDetail: true,
            },
        });
        res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get profile' });
    }
};

/** Update the user's profile fields */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, phone, address, city, state, pincode, panNumber, aadharNumber, dateOfBirth, profileImage } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user?.id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(pincode !== undefined && { pincode }),
                ...(panNumber !== undefined && { panNumber }),
                ...(aadharNumber !== undefined && { aadharNumber }),
                ...(dateOfBirth !== undefined && { dateOfBirth }),
                ...(profileImage !== undefined && { profileImage }),
            },
        });

        const { password: _, ...userData } = user;
        res.status(200).json({ status: 'success', data: userData });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to update profile' });
    }
};

/** Change the user's password */
export const changeUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { res.status(400).json({ status: 'error', message: 'Current password is incorrect' }); return; }

        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(newPassword, salt);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

        res.status(200).json({ status: 'success', message: 'Password changed successfully' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to change password' });
    }
};

/** Create or update the user's bank details */
export const updateBankDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { accountHolder, accountNumber, ifscCode, bankName, branchName, upiId } = req.body;

        const bankDetail = await prisma.bankDetail.upsert({
            where: { userId: req.user?.id },
            create: {
                userId: req.user!.id,
                accountHolder: accountHolder || '',
                accountNumber: accountNumber || '',
                ifscCode: ifscCode || '',
                bankName: bankName || '',
                branchName: branchName || '',
                upiId: upiId || '',
            },
            update: {
                ...(accountHolder !== undefined && { accountHolder }),
                ...(accountNumber !== undefined && { accountNumber }),
                ...(ifscCode !== undefined && { ifscCode }),
                ...(bankName !== undefined && { bankName }),
                ...(branchName !== undefined && { branchName }),
                ...(upiId !== undefined && { upiId }),
            },
        });
        res.status(200).json({ status: 'success', data: bankDetail });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to update bank details' });
    }
};
