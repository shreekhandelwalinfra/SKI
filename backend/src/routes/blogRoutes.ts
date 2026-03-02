import { Router } from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blogController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

export default router;
