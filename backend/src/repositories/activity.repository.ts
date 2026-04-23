import { BaseRepository } from './base.repository';
import { IActivityLog, ActivityAction } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Activity Log Repository
 * Handles audit trail operations
 */
export class ActivityRepository extends BaseRepository {
  constructor() {
    super('activity_logs');
  }

  /**
   * Create activity log entry
   */
  async create(logData: {
    tenantId: string;
    userId: string;
    entityType: string;
    entityId: string;
    action: ActivityAction;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IActivityLog> {
    const id = uuidv4();
    const result = await this.query(
      `INSERT INTO activity_logs (id, tenant_id, user_id, entity_type, entity_id, action, changes, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        logData.tenantId,
        logData.userId,
        logData.entityType,
        logData.entityId,
        logData.action,
        JSON.stringify(logData.changes || {}),
        JSON.stringify(logData.metadata || {}),
        logData.ipAddress || null,
        logData.userAgent || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Get activity logs with pagination
   */
  async findWithPagination(
    tenantId: string,
    page: number,
    limit: number,
    filters?: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      action?: ActivityAction;
    }
  ): Promise<{ logs: IActivityLog[]; total: number }> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramCount = 2;

    if (filters?.userId) {
      conditions.push(`user_id = $${paramCount}`);
      values.push(filters.userId);
      paramCount++;
    }

    if (filters?.entityType) {
      conditions.push(`entity_type = $${paramCount}`);
      values.push(filters.entityType);
      paramCount++;
    }

    if (filters?.entityId) {
      conditions.push(`entity_id = $${paramCount}`);
      values.push(filters.entityId);
      paramCount++;
    }

    if (filters?.action) {
      conditions.push(`action = $${paramCount}`);
      values.push(filters.action);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await this.query(
      `SELECT COUNT(*) FROM activity_logs WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const logsResult = await this.query(
      `SELECT al.*, u.first_name || ' ' || u.last_name as user_name, u.email as user_email
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    return {
      logs: logsResult.rows,
      total,
    };
  }

  /**
   * Get activity logs for a specific entity
   */
  async findByEntity(
    tenantId: string,
    entityType: string,
    entityId: string
  ): Promise<IActivityLog[]> {
    const result = await this.query(
      `SELECT al.*, u.first_name || ' ' || u.last_name as user_name, u.email as user_email
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.tenant_id = $1 AND al.entity_type = $2 AND al.entity_id = $3
       ORDER BY al.created_at DESC`,
      [tenantId, entityType, entityId]
    );
    return result.rows;
  }
}
