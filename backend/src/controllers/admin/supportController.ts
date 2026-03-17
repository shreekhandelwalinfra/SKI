import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { broadcastSocketEvent, getIO } from '../../config/socket';
import { notifyUser } from '../../services/notificationService';

// ─── SUPPORT ─────────────────────────────────────────────

/** Map frontend status strings to DB enum values */
function mapTicketStatus(frontendStatus: string | undefined): string | undefined {
    if (!frontendStatus || typeof frontendStatus !== 'string') return undefined;
    const statusMap: Record<string, string> = {
        'open': 'OPEN',
        'in_progress': 'IN_PROGRESS',
        'inprogress': 'IN_PROGRESS',
        'resolved': 'RESOLVED',
    };
    const key = frontendStatus.toLowerCase().replace(/\s+/g, '');
    return statusMap[key] || frontendStatus.toUpperCase();
}

/** List support tickets with optional status filter */
export const getSupportTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.query;
        const where: any = {};
        if (status) where.status = mapTicketStatus(status as string);

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: { user: { select: { name: true, uniqueId: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: tickets });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get support tickets' });
    }
};

/** Update a support ticket (status and/or admin reply) */
export const updateSupportTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, adminReply } = req.body;

        const existing = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!existing) { res.status(404).json({ status: 'error', message: 'Ticket not found' }); return; }

        const updateData: any = {};
        if (status) updateData.status = mapTicketStatus(status);

        if (adminReply && adminReply.trim()) {
            updateData.adminReply = adminReply;
            const currentMessages = Array.isArray(existing.messages) ? (existing.messages as any[]) : [];
            currentMessages.push({ sender: 'admin', text: adminReply.trim(), time: new Date().toISOString() });
            updateData.messages = currentMessages;
        }

        const ticket = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: updateData,
            include: { user: { select: { name: true, uniqueId: true, email: true } } },
        });
        broadcastSocketEvent('support:updated', { action: 'update', ticket });

        if (updateData.adminReply || updateData.status) {
            await notifyUser({
                userId: ticket.userId,
                type: 'SUPPORT',
                title: 'Support Ticket Updated',
                message: `Admin has ${updateData.adminReply ? 'replied to' : 'updated'} your ticket: "${ticket.subject}"`,
                link: '/user/support'
            }).catch(err => console.error('Failed to notify user:', err));
        }

        res.status(200).json({ status: 'success', data: ticket });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update ticket' });
    }
};

/** Mark a ticket as seen by admin */
export const markTicketSeen = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticket = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: {
                // @ts-ignore
                lastSeenByAdmin: new Date()
            },
            include: { user: { select: { name: true, uniqueId: true, email: true } } },
        });
        getIO()?.emit('support:updated', { action: 'update', ticket });
        res.status(200).json({ status: 'success', data: ticket });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark ticket as seen' });
    }
};

/** Delete a support ticket */
export const deleteSupportTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.supportTicket.delete({ where: { id: req.params.id } });
        getIO()?.emit('support:updated', { action: 'delete', ticketId: req.params.id });
        res.status(200).json({ status: 'success', message: 'Ticket deleted' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to delete ticket' });
    }
};

/** Delete a specific message from a ticket (admin messages only) */
export const deleteTicketMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const messageIndex = parseInt(req.params.messageIndex, 10);
        if (isNaN(messageIndex)) {
            res.status(400).json({ status: 'error', message: 'Invalid message index' }); return;
        }

        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!ticket) { res.status(404).json({ status: 'error', message: 'Ticket not found' }); return; }

        const messages = Array.isArray(ticket.messages) ? (ticket.messages as any[]) : [];
        if (messageIndex < 0 || messageIndex >= messages.length) {
            res.status(400).json({ status: 'error', message: 'Message index out of bounds' }); return;
        }
        if (messages[messageIndex].sender !== 'admin') {
            res.status(403).json({ status: 'error', message: 'Can only delete admin messages' }); return;
        }

        messages.splice(messageIndex, 1);
        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { messages },
            include: { user: { select: { name: true, uniqueId: true, email: true } } },
        });
        getIO()?.emit('support:updated', { action: 'update', ticket: updated });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to delete message' });
    }
};
