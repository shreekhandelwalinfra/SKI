import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, verifyEmail, resendVerification, logout, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth.validators';

const router = Router();

// ─── RATE LIMITERS ───────────────────────────────────────────

/**
 * Strict limiter for high-risk auth routes (register, login).
 * IP is blocked for 15 minutes after 10 failed attempts.
 * Prevents:
 *  - Brute-force password attacks on /login
 *  - Spam account creation on /register
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many attempts. Please try again after 15 minutes.' },
});

/**
 * Relaxed limiter for OTP resend — max 5 requests per 15 min.
 * The per-account cooldown (60s) and max-3-attempts lock are enforced
 * at the controller level, not here.
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many OTP requests. Please try again after 15 minutes.' },
});

// ─── PUBLIC ROUTES ───────────────────────────────────────────

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);

// OTP verification (no auth needed — user doesn't have a token yet)
router.post('/verify-email', otpLimiter, verifyEmail);
router.post('/resend-verification', otpLimiter, resendVerification);

// Password Reset (Rate limited individually)
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);

// ─── PROTECTED ROUTES ────────────────────────────────────────

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
