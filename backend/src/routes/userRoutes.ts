import { Router } from 'express';
import { protect, requireActive } from '../middleware/auth';

// ─── Domain Controllers ──────────────────────────────────
import { getUserDashboard } from '../controllers/user/dashboardController';
import { getMyTeam } from '../controllers/user/teamController';
import { getUserInvestments, createInvestment, getUserPropertyDeals, getUserRewards } from '../controllers/user/investmentController';
import { getUserTickets, createTicket, replyToTicket, markTicketSeenByUser } from '../controllers/user/supportController';
import { getSelfReward, getTeamBonusProfit, getDirectBonusProfit } from '../controllers/user/profitController';
import { getProfile, updateProfile, changeUserPassword, updateBankDetails } from '../controllers/user/profileController';
import { getNotifications, markNotificationsRead, markNotificationRead } from '../controllers/user/notificationController';

const router = Router();

// All routes require authentication
router.use(protect);

// ─── ALWAYS ACCESSIBLE (even for PENDING users) ─────────
router.get('/dashboard', getUserDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changeUserPassword);
router.put('/profile/bank', updateBankDetails);

// ─── READ-ONLY for all (PENDING can view, just not act) ─
router.get('/team', getMyTeam);
router.get('/investments', getUserInvestments);
router.get('/property-deals', getUserPropertyDeals);
router.get('/rewards', getUserRewards);
router.get('/support', getUserTickets);
router.get('/profit/self-reward', getSelfReward);
router.get('/profit/team-bonus', getTeamBonusProfit);
router.get('/profit/direct-bonus', getDirectBonusProfit);

// ─── ACTIONS require ACTIVE status ──────────────────────
router.post('/investments', requireActive, createInvestment);
router.post('/support', requireActive, createTicket);
router.post('/support/:id/reply', requireActive, replyToTicket);
router.put('/support/:id/seen', requireActive, markTicketSeenByUser);

// ─── NOTIFICATIONS ───────────────────────────────────────
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
