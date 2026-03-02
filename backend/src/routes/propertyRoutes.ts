import { Router } from 'express';
import {
    getProperties,
    getPropertyBySlug,
    createProperty,
    updateProperty,
    deleteProperty,
    getCategoryStats,
} from '../controllers/propertyController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/categories/stats', getCategoryStats);
router.get('/:slug', getPropertyBySlug);

// Admin routes
router.post('/', protect, adminOnly, createProperty);
router.put('/:id', protect, adminOnly, updateProperty);
router.delete('/:id', protect, adminOnly, deleteProperty);

export default router;
