import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
    getDashboardStats,
    getUsers, addUser, activateUser, blockUser, deleteUser,
    getInvestments, updateInvestmentStatus,
    getPropertyDeals, createPropertyDeal, addInstallment,
    getRewards,
    getFirmProfit, getTeamBonus, getUserIncome,
    getSupportTickets, updateSupportTicket,
    changePassword,
    getAdminUserTree, updateUserBalances,
    cleanupDataHandler
} from '../controllers/adminController';

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

// Change Password
router.put('/change-password', changePassword);

// System Cleanup
router.post('/system/cleanup', cleanupDataHandler);

export default router;
