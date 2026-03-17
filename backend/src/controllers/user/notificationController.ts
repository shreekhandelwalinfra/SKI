import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { getUserNotifications, markAllRead, markOneRead } from '../../services/notificationService';

// ─── NOTIFICATIONS ───────────────────────────────────────

/** Get paginated user notifications */
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await getUserNotifications(req.user!.id, page, limit);
        res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get notifications' });
    }
};

/** Mark all user notifications as read */
export const markNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await markAllRead(req.user!.id);
        res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark notifications' });
    }
};

/** Mark a single user notification as read */
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await markOneRead(req.params.id);
        res.status(200).json({ status: 'success', message: 'Notification marked as read' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to mark notification' });
    }
};
