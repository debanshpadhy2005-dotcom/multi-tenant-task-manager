import { BaseRepository } from './base.repository';
import { INotification, NotificationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Notification Repository
 * Handles notification operations
 */
export class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Create notification
   */
  async create(notificationData: {
    tenantId: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
  }): Promise<INotification> {
    const id = uuidv4();
    const result = await this.query(
      `INSERT INTO notifications (id, tenant_id, user_id, type, title, message, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        notificationData.tenantId,
        notificationData.userId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.entityType || null,
        notificationData.entityId || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Get user notifications
   */
  async findByUser(
    userId: string,
    tenantId: string,
    limit = 50,
    offset = 0
  ): Promise<INotification[]> {
    const result = await this.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND tenant_id = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [userId, tenantId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    const result = await this.query(
      `SELECT COUNT(*) FROM notifications 
       WHERE user_id = $1 AND tenant_id = $2 AND is_read = false`,
      [userId, tenantId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string, tenantId: string): Promise<boolean> {
    const result = await this.query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 AND tenant_id = $3`,
      [id, userId, tenantId]
    );
    return result.rowCount > 0;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, tenantId: string): Promise<number> {
    const result = await this.query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND tenant_id = $2 AND is_read = false`,
      [userId, tenantId]
    );
    return result.rowCount;
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const result = await this.query(
      `DELETE FROM notifications 
       WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'`
    );
    return result.rowCount;
  }
}
