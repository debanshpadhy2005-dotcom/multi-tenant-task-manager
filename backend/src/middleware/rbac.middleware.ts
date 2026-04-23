import { Response, NextFunction } from 'express';
import { AuthRequest, Permission, RoleType } from '../types';
import { logger } from '../utils/logger';

/**
 * Role-Based Access Control Middleware
 * Checks if user has required permissions
 */

/**
 * Check if user has specific permission
 */
export const hasPermission = (requiredPermission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userPermissions = (req.user as any).permissions || [];
    
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }

    logger.warn(`Permission denied for user ${req.user.id}: ${requiredPermission}`);
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
    });
  };
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (requiredPermissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userPermissions = (req.user as any).permissions || [];
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (hasPermission) {
      return next();
    }

    logger.warn(`Permission denied for user ${req.user.id}`);
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
    });
  };
};

/**
 * Check if user has specific role
 */
export const hasRole = (requiredRoles: RoleType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userRole = (req.user as any).role_name;
    
    if (requiredRoles.includes(userRole)) {
      return next();
    }

    logger.warn(`Role check failed for user ${req.user.id}: required ${requiredRoles}, has ${userRole}`);
    return res.status(403).json({
      success: false,
      error: 'Insufficient role privileges',
    });
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = hasRole([RoleType.ADMIN]);

/**
 * Check if user is admin or manager
 */
export const isAdminOrManager = hasRole([RoleType.ADMIN, RoleType.MANAGER]);

/**
 * Resource ownership check
 * Verifies if user owns the resource or has permission to access all resources
 */
export const canAccessResource = (
  resourceUserIdField: string = 'userId',
  allAccessPermission?: Permission
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const currentUserId = req.user.id;

    // Check if user owns the resource
    if (resourceUserId === currentUserId) {
      return next();
    }

    // Check if user has permission to access all resources
    if (allAccessPermission) {
      const userPermissions = (req.user as any).permissions || [];
      if (userPermissions.includes(allAccessPermission)) {
        return next();
      }
    }

    logger.warn(`Resource access denied for user ${req.user.id}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied to this resource',
    });
  };
};
