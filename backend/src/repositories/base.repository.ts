import { pool } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Base Repository Class
 * Provides common database operations with tenant isolation
 */
export abstract class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Execute a query with tenant isolation
   */
  async query(text: string, params?: any[]) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      logger.error(`Query error in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find by ID with tenant isolation
   */
  async findById(id: string, tenantId: string): Promise<any | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all with tenant isolation
   */
  async findAll(tenantId: string, limit = 100, offset = 0): Promise<any[]> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND deleted_at IS NULL 
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Count records with tenant isolation
   */
  async count(tenantId: string, whereClause = ''): Promise<number> {
    const query = whereClause
      ? `SELECT COUNT(*) FROM ${this.tableName} WHERE tenant_id = $1 AND deleted_at IS NULL AND ${whereClause}`
      : `SELECT COUNT(*) FROM ${this.tableName} WHERE tenant_id = $1 AND deleted_at IS NULL`;
    
    const result = await this.query(query, [tenantId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Soft delete
   */
  async softDelete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.query(
      `UPDATE ${this.tableName} SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [id, tenantId]
    );
    return result.rowCount > 0;
  }

  /**
   * Hard delete (use with caution)
   */
  async hardDelete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    return result.rowCount > 0;
  }
}
