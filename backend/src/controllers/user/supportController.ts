import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { broadcastSocketEvent } from '../../config/socket';
import { notifyAdmin } from '../../services/notificationService';

// ─── SUPPORT ─────────────────────────────────────────────

/** Get the user's support tickets */
export const getUserTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user?.id },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: tickets });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get tickets' });
    }
};

/** User creates a new support ticket */
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user) { res.status(404).json({ status: 'error', message: 'User not found' }); return; }

        const { subject, message } = req.body;
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                subject, message,
                messages: [{ sender: 'user', text: message, time: new Date().toISOString() }],
            },
        });
        broadcastSocketEvent('support:updated', { action: 'create', ticket });

        await notifyAdmin({
            type: 'SUPPORT',
            title: 'New Support Ticket',
            message: `${user.name} opened a new ticket: "${subject}"`,
            link: '/admin/support'
        }).catch(err => console.error('Failed to notify admin:', err));

        res.status(201).json({ status: 'success', data: ticket });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create ticket' });
    }
};

/** User replies to their own ticket */
export const replyToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticket = await prisma.supportTicket.findFirst({
            where: { id: req.params.id, userId: req.user?.id },
        });
        if (!ticket) { res.status(404).json({ status: 'error', message: 'Ticket not found' }); return; }

        const existingMessages = (ticket.messages as any[]) || [];
        existingMessages.push({ sender: 'user', text: req.body.message, time: new Date().toISOString() });

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { messages: existingMessages },
        });

        broadcastSocketEvent('support:updated', { action: 'update', ticket: updated });

        await notifyAdmin({
            type: 'SUPPORT',
            title: 'New Ticket Reply',
            message: `${ticket.name} replied to ticket: "${ticket.subject}"`,
            link: '/admin/support'
        }).catch(err => console.error('Failed to notify admin:', err));

        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to reply' });
    }
};

/** Mark a ticket as seen by the user */
export const markTicketSeenByUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticket = await prisma.supportTicket.findFirst({
            where: { id: req.params.id, userId: req.user?.id },
        });
        if (!ticket) { res.status(404).json({ status: 'error', message: 'Ticket not found' }); return; }

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: {
                // @ts-ignore
                lastSeenByUser: new Date()
            },
        });
        broadcastSocketEvent('support:updated', { action: 'update', ticket: updated });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark ticket as seen' });
    }
};
