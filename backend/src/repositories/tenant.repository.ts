import { BaseRepository } from './base.repository';
import { ITenant } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tenant Repository
 * Handles organization/tenant operations
 */
export class TenantRepository extends BaseRepository {
  constructor() {
    super('tenants');
  }

  /**
   * Create new tenant
   */
  async create(tenantData: {
    name: string;
    slug: string;
    domain?: string;
    settings?: Record<string, any>;
  }): Promise<ITenant> {
    const id = uuidv4();
    const result = await this.query(
      `INSERT INTO tenants (id, name, slug, domain, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id,
        tenantData.name,
        tenantData.slug,
        tenantData.domain || null,
        JSON.stringify(tenantData.settings || {}),
      ]
    );
    return result.rows[0];
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<ITenant | null> {
    const result = await this.query(
      `SELECT * FROM tenants WHERE slug = $1 AND deleted_at IS NULL`,
      [slug]
    );
    return result.rows[0] || null;
  }

  /**
   * Find tenant by domain
   */
  async findByDomain(domain: string): Promise<ITenant | null> {
    const result = await this.query(
      `SELECT * FROM tenants WHERE domain = $1 AND deleted_at IS NULL`,
      [domain]
    );
    return result.rows[0] || null;
  }

  /**
   * Update tenant
   */
  async update(id: string, updates: Partial<ITenant>): Promise<ITenant | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'settings' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await this.query(
      `UPDATE tenants SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Get all active tenants
   */
  async findAllActive(): Promise<ITenant[]> {
    const result = await this.query(
      `SELECT * FROM tenants WHERE is_active = true AND deleted_at IS NULL ORDER BY created_at DESC`
    );
    return result.rows;
  }
}
