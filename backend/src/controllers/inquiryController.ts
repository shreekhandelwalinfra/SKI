import { Request, Response } from 'express';
import prisma from '../config/database';

// POST /api/inquiries
export const createInquiry = async (req: Request, res: Response): Promise<void> => {
    try {
        const inquiry = await prisma.inquiry.create({ data: req.body });
        res.status(201).json({ status: 'success', data: inquiry, message: 'Inquiry submitted successfully' });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to submit inquiry' });
    }
};

// GET /api/inquiries (admin)
export const getInquiries = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, parseInt(limit as string));

        const where: any = {};
        if (status) where.status = (status as string).toUpperCase();

        const [inquiries, total] = await Promise.all([
            prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * limitNum, take: limitNum }),
            prisma.inquiry.count({ where }),
        ]);

        res.status(200).json({
            status: 'success', data: inquiries,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch inquiries' });
    }
};

// PUT /api/inquiries/:id/status (admin)
export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const inquiry = await prisma.inquiry.update({
            where: { id: req.params.id },
            data: { status: req.body.status },
        });
        res.status(200).json({ status: 'success', data: inquiry });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update inquiry' });
    }
};
