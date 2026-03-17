import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { getAdminNotifications, markAllRead, markOneRead } from '../../services/notificationService';
import { getAdminLogs as fetchAdminLogs } from '../../services/adminLogService';

// ─── NOTIFICATIONS ───────────────────────────────────────

/** Get paginated admin notifications */
export const getAdminNotifications_handler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await getAdminNotifications(page, limit);
        res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get notifications' });
    }
};

/** Mark all admin notifications as read */
export const markAdminNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await markAllRead(null); // null = admin notifications
        res.status(200).json({ status: 'success', message: 'All admin notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark notifications' });
    }
};

/** Mark a single admin notification as read */
export const markAdminNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await markOneRead(req.params.id);
        res.status(200).json({ status: 'success', message: 'Notification marked as read' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark notification' });
    }
};

// ─── ADMIN AUDIT LOGS ────────────────────────────────────

/** Get paginated admin audit logs with optional action/admin filters */
export const getAdminLogsHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 30;
        const action = req.query.action as string | undefined;
        const adminId = req.query.adminId as string | undefined;
        const result = await fetchAdminLogs(page, limit, { action, adminId });
        res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get admin logs' });
    }
};
