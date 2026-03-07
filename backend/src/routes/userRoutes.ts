import { Router } from 'express';
import {
    getUserDashboard, getMyTeam,
    getUserInvestments, createInvestment,
    getUserPropertyDeals, getUserRewards,
    getUserTickets, createTicket, replyToTicket, markTicketSeenByUser,
    getSelfReward, getTeamBonusProfit, getDirectBonusProfit,
    getProfile, updateProfile, changeUserPassword, updateBankDetails,
} from '../controllers/userController';
import { protect, requireActive } from '../middleware/auth';

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

export default router;
