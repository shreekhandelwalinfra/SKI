import { Request, Response } from 'express';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

// Helper to create slug from title
const createSlug = (title: string): string => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Map frontend category strings to Prisma enums
const categoryMap: Record<string, any> = {
    'residential-land': 'RESIDENTIAL_LAND',
    'commercial-land': 'COMMERCIAL_LAND',
    'mvda-approved': 'MVDA_APPROVED',
    'mathura-vrindavan': 'MATHURA_VRINDAVAN',
    'noida-greater-noida-jewar': 'NOIDA_GREATER_NOIDA_JEWAR',
};

const listingTypeMap: Record<string, any> = {
    'sale': 'SALE',
    'purchase': 'PURCHASE',
};

// GET /api/properties
export const getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            category, listingType, city, minPrice, maxPrice, minArea, maxArea,
            isFeatured, isMVDAApproved, search, page = '1', limit = '12', sort = '-createdAt',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

        const where: Prisma.PropertyWhereInput = { isActive: true };

        if (category) where.category = categoryMap[category as string] || category;
        if (listingType) where.listingType = listingTypeMap[listingType as string] || listingType;
        if (city) where.city = { contains: city as string, mode: 'insensitive' };
        if (isFeatured === 'true') where.isFeatured = true;
        if (isMVDAApproved === 'true') where.isMVDAApproved = true;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }
        if (minArea || maxArea) {
            where.area = {};
            if (minArea) where.area.gte = Number(minArea);
            if (maxArea) where.area.lte = Number(maxArea);
        }
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { address: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // Parse sort string
        const sortField = (sort as string).startsWith('-') ? (sort as string).slice(1) : sort as string;
        const sortOrder = (sort as string).startsWith('-') ? 'desc' : 'asc';
        const orderBy: any = { [sortField]: sortOrder };

        const [properties, total] = await Promise.all([
            prisma.property.findMany({ where, orderBy, skip: (pageNum - 1) * limitNum, take: limitNum }),
            prisma.property.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: properties,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch properties' });
    }
};

// GET /api/properties/:slug
export const getPropertyBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const property = await prisma.property.update({
            where: { slug: req.params.slug },
            data: { views: { increment: 1 } },
        });

        if (!property || !property.isActive) {
            res.status(404).json({ status: 'error', message: 'Property not found' });
            return;
        }

        res.status(200).json({ status: 'success', data: property });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch property' });
    }
};

// POST /api/properties
export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const slug = createSlug(req.body.title);
        const existing = await prisma.property.findUnique({ where: { slug } });
        const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

        const { title, description, price, priceUnit, area, areaUnit, isFeatured, isActive, isMVDAApproved,
            possession, facing, roadWidth, images, highlights, amenities } = req.body;
        const location = req.body.location || {};
        const contactPerson = req.body.contactPerson || {};

        const property = await prisma.property.create({
            data: {
                title, slug: uniqueSlug, description: description || '',
                category: categoryMap[req.body.category] || 'RESIDENTIAL_LAND',
                listingType: listingTypeMap[req.body.listingType] || 'SALE',
                price: Number(price), priceUnit: priceUnit || 'total',
                area: Number(area), areaUnit: areaUnit || 'sqft',
                address: location.address || '', city: location.city || '',
                state: location.state || 'Uttar Pradesh', pincode: location.pincode || '',
                zone: location.zone || '',
                isFeatured: isFeatured || false, isActive: isActive !== false,
                isMVDAApproved: isMVDAApproved || false,
                possession: possession || '', facing: facing || '', roadWidth: roadWidth || '',
                images: images || [], highlights: highlights || [], amenities: amenities || [],
                contactName: contactPerson.name || '', contactPhone: contactPerson.phone || '',
                contactEmail: contactPerson.email || '',
            },
        });

        res.status(201).json({ status: 'success', data: property });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create property' });
    }
};

// PUT /api/properties/:id
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const data: any = { ...req.body };
        if (data.title) data.slug = createSlug(data.title);
        if (data.category) data.category = categoryMap[data.category] || data.category;
        if (data.listingType) data.listingType = listingTypeMap[data.listingType] || data.listingType;
        if (data.location) {
            data.address = data.location.address; data.city = data.location.city;
            data.state = data.location.state; data.pincode = data.location.pincode;
            data.zone = data.location.zone; delete data.location;
        }
        if (data.contactPerson) {
            data.contactName = data.contactPerson.name; data.contactPhone = data.contactPerson.phone;
            data.contactEmail = data.contactPerson.email; delete data.contactPerson;
        }

        const property = await prisma.property.update({ where: { id: req.params.id }, data });

        res.status(200).json({ status: 'success', data: property });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to update property' });
    }
};

// DELETE /api/properties/:id
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.property.delete({ where: { id: req.params.id } });
        res.status(200).json({ status: 'success', message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete property' });
    }
};

// GET /api/properties/categories/stats
export const getCategoryStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const stats = await prisma.property.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { category: true },
        });

        const data = stats.map(s => ({ _id: s.category, count: s._count.category }));
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
    }
};
