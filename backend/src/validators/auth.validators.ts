import { z } from 'zod';

// Authentication Schemas
export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Name must be at least 3 characters long').max(100),
        email: z.string().email('Invalid email address'),
        phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        referralCode: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});
