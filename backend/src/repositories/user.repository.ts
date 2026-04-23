import { BaseRepository } from './base.repository';
import { IUser } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * User Repository
 * Handles all database operations for users
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * Find user by email (across all tenants for login)
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const result = await this.query(
      `SELECT u.id, u.tenant_id as "tenantId", u.email, u.first_name as "firstName", 
              u.last_name as "lastName", u.password, u.role_id as "roleId", 
              u.is_active as "isActive", u.is_oauth_user as "isOAuthUser",
              u.oauth_provider as "oauthProvider", u.oauth_id as "oauthId",
              u.created_at as "createdAt", u.updated_at as "updatedAt",
              r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by email within a specific tenant
   */
  async findByEmailAndTenant(email: string, tenantId: string): Promise<IUser | null> {
    const result = await this.query(
      `SELECT u.id, u.tenant_id as "tenantId", u.email, u.first_name as "firstName", 
              u.last_name as "lastName", u.password, u.role_id as "roleId", 
              u.is_active as "isActive", u.is_oauth_user as "isOAuthUser",
              u.oauth_provider as "oauthProvider", u.oauth_id as "oauthId",
              u.created_at as "createdAt", u.updated_at as "updatedAt",
              r.name as role, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1 AND u.tenant_id = $2 AND u.deleted_at IS NULL`,
      [email, tenantId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID with role information
   */
  async findById(id: string, tenantId: string): Promise<IUser | null> {
    const result = await this.query(
      `SELECT u.id, u.tenant_id as "tenantId", u.email, u.first_name as "firstName", 
              u.last_name as "lastName", u.password, u.role_id as "roleId", 
              u.is_active as "isActive", u.is_oauth_user as "isOAuthUser",
              u.oauth_provider as "oauthProvider", u.oauth_id as "oauthId",
              u.created_at as "createdAt", u.updated_at as "updatedAt",
              r.name as role, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1 AND u.tenant_id = $2 AND u.deleted_at IS NULL`,
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create new user
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const id = uuidv4();
    const result = await this.query(
      `INSERT INTO users (id, tenant_id, email, first_name, last_name, password, role_id, is_oauth_user, oauth_provider, oauth_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        userData.tenantId,
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.password || null,
        userData.roleId,
        userData.isOAuthUser || false,
        userData.oauthProvider || null,
        userData.oauthId || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Update user
   */
  async update(id: string, tenantId: string, updates: Partial<IUser>): Promise<IUser | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id, tenantId);
    const result = await this.query(
      `UPDATE users SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Get all users in a tenant
   */
  async findAllByTenant(tenantId: string, limit = 100, offset = 0): Promise<IUser[]> {
    const result = await this.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.tenant_id = $1 AND u.deleted_at IS NULL 
       ORDER BY u.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string, tenantId: string): Promise<void> {
    await this.query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP 
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
  }
}
