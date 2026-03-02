import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus } from '../controllers/inquiryController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public
router.post('/', createInquiry);

// Admin
router.get('/', protect, adminOnly, getInquiries);
router.put('/:id/status', protect, adminOnly, updateInquiryStatus);

export default router;
