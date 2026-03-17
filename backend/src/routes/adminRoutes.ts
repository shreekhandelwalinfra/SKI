import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';

// ─── Domain Controllers ──────────────────────────────────
import { getDashboardStats } from '../controllers/admin/dashboardController';
import { getUsers, addUser, activateUser, blockUser, deleteUser, getAdminUserTree, updateUserBalances } from '../controllers/admin/userManagementController';
import { getInvestments, updateInvestmentStatus } from '../controllers/admin/investmentController';
import { getPropertyDeals, createPropertyDeal, addInstallment } from '../controllers/admin/propertyDealController';
import { getRewards, getFirmProfit, getTeamBonus, getUserIncome } from '../controllers/admin/profitController';
import { getSupportTickets, updateSupportTicket, markTicketSeen, deleteSupportTicket, deleteTicketMessage } from '../controllers/admin/supportController';
import { changePassword, cleanupDataHandler } from '../controllers/admin/systemController';
import { getAdminNotifications_handler, markAdminNotificationsRead, markAdminNotificationRead, getAdminLogsHandler } from '../controllers/admin/notificationController';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getUsers);
router.post('/users', addUser);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/tree', getAdminUserTree);
router.put('/users/:id/balances', updateUserBalances);

// Investments
router.get('/investments', getInvestments);
router.put('/investments/:id', updateInvestmentStatus);

// Property Deals & Installments (MLM Compensation)
router.get('/property-deals', getPropertyDeals);
router.post('/property-deals', createPropertyDeal);
router.post('/property-deals/:id/installment', addInstallment);

// Rewards
router.get('/rewards', getRewards);

// Profit
router.get('/profit/firm', getFirmProfit);
router.get('/profit/team-bonus', getTeamBonus);
router.get('/profit/user-income', getUserIncome);

// Support
router.get('/support', getSupportTickets);
router.put('/support/:id', updateSupportTicket);
router.put('/support/:id/seen', markTicketSeen);
router.delete('/support/:id', deleteSupportTicket);
router.delete('/support/:id/message/:messageIndex', deleteTicketMessage);

// Change Password
router.put('/change-password', changePassword);

// System Cleanup
router.post('/system/cleanup', cleanupDataHandler);

// Notifications
router.get('/notifications', getAdminNotifications_handler);
router.put('/notifications/read', markAdminNotificationsRead);
router.put('/notifications/:id/read', markAdminNotificationRead);

// Admin Audit Logs
router.get('/logs', getAdminLogsHandler);

export default router;
