import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import prisma from './config/database';
import { initSocket } from './config/socket';
import propertyRoutes from './routes/propertyRoutes';
import authRoutes from './routes/authRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import blogRoutes from './routes/blogRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Express
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server + attach Socket.io
const httpServer = createServer(app);
initSocket(httpServer);

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'SKI Backend API is running (PostgreSQL + Prisma)',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server (httpServer so Socket.io shares the port)
httpServer.listen(PORT, () => {
    console.log(`🏗️ SKI Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: PostgreSQL (Prisma)`);
    console.log(`🔌 WebSocket: Socket.io ready`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export default app;
