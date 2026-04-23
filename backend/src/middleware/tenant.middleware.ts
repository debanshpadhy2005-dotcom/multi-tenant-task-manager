import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

/**
 * Tenant Isolation Middleware
 * Ensures all requests are scoped to the authenticated user's tenant
 */

/**
 * Validate tenant context
 * Ensures tenantId is present in the request
 */
export const validateTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenantId) {
    logger.error('Tenant context missing in request');
    return res.status(400).json({
      success: false,
      error: 'Tenant context required',
    });
  }

  next();
};

/**
 * Prevent cross-tenant access
 * Validates that any tenant-specific parameters match the authenticated user's tenant
 */
export const preventCrossTenantAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const requestTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

  // If a tenantId is specified in the request, ensure it matches the user's tenant
  if (requestTenantId && requestTenantId !== req.tenantId) {
    logger.warn(
      `Cross-tenant access attempt: User tenant ${req.tenantId}, requested tenant ${requestTenantId}`
    );
    return res.status(403).json({
      success: false,
      error: 'Cross-tenant access denied',
    });
  }

  next();
};

/**
 * Inject tenant ID into request body
 * Automatically adds tenantId to request body for create/update operations
 */
export const injectTenantId = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.tenantId && req.body) {
    req.body.tenantId = req.tenantId;
  }
  next();
};
