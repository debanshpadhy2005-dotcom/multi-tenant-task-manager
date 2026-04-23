import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { UserRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

const userRepository = new UserRepository();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Check:', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!authHeader,
      authHeaderStart: authHeader?.substring(0, 20)
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    const payload = verifyAccessToken(token);
    
    if (!payload) {
      console.log('❌ Token verification failed');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    const user = await userRepository.findById(payload.userId, payload.tenantId);
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive');
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
      });
    }

    console.log('✅ User authenticated:', user.email);

    req.user = user;
    req.tenantId = payload.tenantId;

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't fail if not present
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      if (payload) {
        const user = await userRepository.findById(payload.userId, payload.tenantId);
        if (user && user.isActive) {
          req.user = user;
          req.tenantId = payload.tenantId;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
