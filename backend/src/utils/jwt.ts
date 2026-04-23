import jwt from 'jsonwebtoken';
import { IJwtPayload, IAuthTokens } from '../types';
import { logger } from './logger';

/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate access token
 */
export const generateAccessToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
    issuer: 'taskmaster-api',
    audience: 'taskmaster-client',
  } as any);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
    issuer: 'taskmaster-api',
    audience: 'taskmaster-client',
  } as any);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload: IJwtPayload): IAuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): IJwtPayload | null => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, {
      issuer: 'taskmaster-api',
      audience: 'taskmaster-client',
    }) as IJwtPayload;
    return decoded;
  } catch (error) {
    logger.error('Access token verification failed:', error);
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): IJwtPayload | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, {
      issuer: 'taskmaster-api',
      audience: 'taskmaster-client',
    }) as IJwtPayload;
    return decoded;
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode failed:', error);
    return null;
  }
};
