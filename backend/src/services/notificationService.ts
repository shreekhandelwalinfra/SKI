import prisma from '../config/database';
import { getIO } from '../config/socket';

// ─── NOTIFICATION SERVICE ────────────────────────────────
// Centralized service for creating & emitting notifications

interface CreateNotificationParams {
    userId?: string | null;  // null = admin notification
    type: string;            // SYSTEM, INVESTMENT, PROFIT, SUPPORT
    title: string;
    message: string;
    link?: string;           // deep-link path
}

/**
 * Create a notification for a specific USER and emit via socket.
 */
export async function notifyUser(params: CreateNotificationParams) {
    const notification = await prisma.notification.create({
        data: {
            userId: params.userId || null,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link || null,
        },
    });

    const io = getIO();
    if (io && params.userId) {
        io.emit('notification:new', { userId: params.userId, notification });
    }

    return notification;
}

/**
 * Create a notification for ALL ADMINS and emit via socket.
 */
export async function notifyAdmin(params: Omit<CreateNotificationParams, 'userId'>) {
    const notification = await prisma.notification.create({
        data: {
            userId: null, // null = admin notification
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link || null,
        },
    });

    const io = getIO();
    if (io) {
        io.emit('admin_notification:new', { notification });
    }

    return notification;
}

/**
 * Get notifications for a user (paginated, newest first).
 */
export async function getUserNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
}

/**
 * Get admin notifications (userId IS NULL), paginated.
 */
export async function getAdminNotifications(page = 1, limit = 20) {
    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: { userId: null },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.notification.count({ where: { userId: null } }),
        prisma.notification.count({ where: { userId: null, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllRead(userId: string | null) {
    const where = userId ? { userId, isRead: false } : { userId: null, isRead: false };
    await prisma.notification.updateMany({ where, data: { isRead: true } });
}

/**
 * Mark a single notification as read.
 */
export async function markOneRead(notificationId: string) {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
}
