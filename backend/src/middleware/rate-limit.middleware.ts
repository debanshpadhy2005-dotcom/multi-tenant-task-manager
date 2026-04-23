import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 */

/**
 * General API rate limiter - DISABLED FOR DEVELOPMENT
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit - effectively disabled
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // Skip in development
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints - DISABLED FOR DEVELOPMENT
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV === 'development', // Skip in development
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later',
    });
  },
});

/**
 * Lenient rate limiter for public endpoints - DISABLED FOR DEVELOPMENT
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit
  skip: () => process.env.NODE_ENV === 'development', // Skip in development
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
});
