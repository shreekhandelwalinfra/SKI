import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error: any) {
            if (error instanceof z.ZodError || error.name === 'ZodError') {
                const errors = error.errors?.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({ status: 'error', message: 'Validation Failed', errors });
            }
            return res.status(400).json({ status: 'error', message: 'Invalid request data' });
        }
    };
};
