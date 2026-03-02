import { Request, Response } from 'express';
import prisma from '../config/database';

const createSlug = (title: string): string => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// GET /api/blog
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tag, page = '1', limit = '10' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(20, parseInt(limit as string));

        const where: any = { isPublished: true };
        if (tag) where.tags = { has: tag as string };

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, author: true, tags: true, createdAt: true },
            }),
            prisma.blog.count({ where }),
        ]);

        res.status(200).json({
            status: 'success', data: blogs,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch blogs' });
    }
};

// GET /api/blog/:slug
export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = await prisma.blog.findFirst({ where: { slug: req.params.slug, isPublished: true } });
        if (!blog) { res.status(404).json({ status: 'error', message: 'Blog not found' }); return; }
        res.status(200).json({ status: 'success', data: blog });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch blog' });
    }
};

// POST /api/blog
export const createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const slug = createSlug(req.body.title);
        const blog = await prisma.blog.create({ data: { ...req.body, slug } });
        res.status(201).json({ status: 'success', data: blog });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create blog' });
    }
};

// PUT /api/blog/:id
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = { ...req.body };
        if (data.title) data.slug = createSlug(data.title);
        const blog = await prisma.blog.update({ where: { id: req.params.id }, data });
        res.status(200).json({ status: 'success', data: blog });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to update blog' });
    }
};

// DELETE /api/blog/:id
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.blog.delete({ where: { id: req.params.id } });
        res.status(200).json({ status: 'success', message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete blog' });
    }
};
