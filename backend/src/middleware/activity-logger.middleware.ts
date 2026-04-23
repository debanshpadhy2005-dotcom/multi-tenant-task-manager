import { Response, NextFunction } from 'express';
import { AuthRequest, ActivityAction } from '../types';
import { ActivityRepository } from '../repositories/activity.repository';
import { logger } from '../utils/logger';

const activityRepository = new ActivityRepository();

/**
 * Activity Logger Middleware
 * Logs user actions for audit trail
 */

/**
 * Log activity after successful operation
 */
export const logActivity = (
  entityType: string,
  action: ActivityAction,
  getEntityId?: (req: AuthRequest) => string
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to log activity after successful response
    res.json = function (body: any) {
      // Only log if response was successful
      if (body.success !== false && req.user && req.tenantId) {
        const entityId = getEntityId ? getEntityId(req) : req.params.id || body.data?.id;
        
        if (entityId) {
          activityRepository
            .create({
              tenantId: req.tenantId,
              userId: req.user.id,
              entityType,
              entityId,
              action,
              changes: action === ActivityAction.UPDATE ? req.body : undefined,
              metadata: {
                method: req.method,
                path: req.path,
              },
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
            })
            .catch(error => {
              logger.error('Failed to log activity:', error);
            });
        }
      }

      return originalJson(body);
    };

    next();
  };
};
