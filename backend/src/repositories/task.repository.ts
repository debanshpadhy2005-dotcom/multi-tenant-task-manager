import { BaseRepository } from './base.repository';
import { ITask, TaskFilters, PaginationParams } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Task Repository
 * Handles all database operations for tasks
 */
export class TaskRepository extends BaseRepository {
  constructor() {
    super('tasks');
  }

  /**
   * Create new task
   */
  async create(taskData: Partial<ITask>): Promise<ITask> {
    const id = uuidv4();
    const result = await this.query(
      `INSERT INTO tasks (id, tenant_id, title, description, status, priority, assigned_to, created_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        taskData.tenantId,
        taskData.title,
        taskData.description || null,
        taskData.status || 'todo',
        taskData.priority || 'medium',
        taskData.assignedTo || null,
        taskData.createdBy,
        taskData.dueDate || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Update task
   */
  async update(id: string, tenantId: string, updates: Partial<ITask>): Promise<ITask | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'tenantId') {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    // Auto-set completed_at when status changes to completed
    if (updates.status === 'completed') {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    }

    values.push(id, tenantId);
    const result = await this.query(
      `UPDATE tasks SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Find tasks with filters and pagination
   */
  async findWithFilters(
    tenantId: string,
    filters: TaskFilters,
    pagination: PaginationParams
  ): Promise<{ tasks: ITask[]; total: number }> {
    const conditions: string[] = ['t.tenant_id = $1', 't.deleted_at IS NULL'];
    const values: any[] = [tenantId];
    let paramCount = 2;

    // Apply filters
    if (filters.status) {
      conditions.push(`t.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      conditions.push(`t.priority = $${paramCount}`);
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.assignedTo) {
      conditions.push(`t.assigned_to = $${paramCount}`);
      values.push(filters.assignedTo);
      paramCount++;
    }

    if (filters.createdBy) {
      conditions.push(`t.created_by = $${paramCount}`);
      values.push(filters.createdBy);
      paramCount++;
    }

    if (filters.dueDateFrom) {
      conditions.push(`t.due_date >= $${paramCount}`);
      values.push(filters.dueDateFrom);
      paramCount++;
    }

    if (filters.dueDateTo) {
      conditions.push(`t.due_date <= $${paramCount}`);
      values.push(filters.dueDateTo);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await this.query(
      `SELECT COUNT(*) FROM tasks t WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const sortBy = pagination.sortBy || 'created_at';
    const sortOrder = pagination.sortOrder || 'DESC';
    const limit = pagination.limit;
    const offset = (pagination.page - 1) * pagination.limit;

    values.push(limit, offset);
    const tasksResult = await this.query(
      `SELECT t.*, 
              u1.first_name || ' ' || u1.last_name as assigned_to_name,
              u2.first_name || ' ' || u2.last_name as created_by_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id AND u1.tenant_id = t.tenant_id
       LEFT JOIN users u2 ON t.created_by = u2.id AND u2.tenant_id = t.tenant_id
       WHERE ${whereClause}
       ORDER BY t.${sortBy} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    return {
      tasks: tasksResult.rows,
      total,
    };
  }

  /**
   * Find task by ID with user details
   */
  async findByIdWithDetails(id: string, tenantId: string): Promise<ITask | null> {
    const result = await this.query(
      `SELECT t.*, 
              u1.first_name || ' ' || u1.last_name as assigned_to_name,
              u1.email as assigned_to_email,
              u2.first_name || ' ' || u2.last_name as created_by_name,
              u2.email as created_by_email
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       WHERE t.id = $1 AND t.tenant_id = $2 AND t.deleted_at IS NULL`,
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get tasks assigned to a user
   */
  async findByAssignedUser(userId: string, tenantId: string): Promise<ITask[]> {
    const result = await this.query(
      `SELECT * FROM tasks 
       WHERE assigned_to = $1 AND tenant_id = $2 AND deleted_at IS NULL 
       ORDER BY due_date ASC NULLS LAST, created_at DESC`,
      [userId, tenantId]
    );
    return result.rows;
  }

  /**
   * Get tasks created by a user
   */
  async findByCreator(userId: string, tenantId: string): Promise<ITask[]> {
    const result = await this.query(
      `SELECT * FROM tasks 
       WHERE created_by = $1 AND tenant_id = $2 AND deleted_at IS NULL 
       ORDER BY created_at DESC`,
      [userId, tenantId]
    );
    return result.rows;
  }

  /**
   * Get task statistics
   */
  async getStatistics(tenantId: string, userId?: string): Promise<any> {
    const userFilter = userId ? 'AND (assigned_to = $2 OR created_by = $2)' : '';
    const params = userId ? [tenantId, userId] : [tenantId];

    const result = await this.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status = 'todo') as todo,
         COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
         COUNT(*) FILTER (WHERE status = 'in_review') as in_review,
         COUNT(*) FILTER (WHERE status = 'completed') as completed,
         COUNT(*) FILTER (WHERE priority = 'urgent') as urgent,
         COUNT(*) FILTER (WHERE due_date < CURRENT_TIMESTAMP AND status NOT IN ('completed', 'cancelled')) as overdue
       FROM tasks 
       WHERE tenant_id = $1 AND deleted_at IS NULL ${userFilter}`,
      params
    );
    return result.rows[0];
  }
}
