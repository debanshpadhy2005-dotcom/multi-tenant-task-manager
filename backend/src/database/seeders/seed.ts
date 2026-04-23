import { pool } from '../../config/database';
import { logger } from '../../utils/logger';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

/**
 * Database Seeder
 * Creates sample data for development and testing
 */

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    logger.info('Starting database seeding...');

    // Create sample tenants
    const tenant1Id = uuidv4();
    const tenant2Id = uuidv4();

    await client.query(
      `INSERT INTO tenants (id, name, slug, domain, is_active, settings) VALUES
       ($1, 'Acme Corporation', 'acme-corp', 'acme.example.com', true, '{"theme": "green", "features": ["tasks", "notifications"]}'),
       ($2, 'TechStart Inc', 'techstart', 'techstart.example.com', true, '{"theme": "blue", "features": ["tasks", "analytics"]}')`,
      [tenant1Id, tenant2Id]
    );

    logger.info('Created sample tenants');

    // Create roles for tenant 1
    const adminRoleId = uuidv4();
    const managerRoleId = uuidv4();
    const memberRoleId = uuidv4();

    await client.query(
      `INSERT INTO roles (id, tenant_id, name, description, permissions) VALUES
       ($1, $2, 'admin', 'Full system access', $3),
       ($4, $2, 'manager', 'Manage team and tasks', $5),
       ($6, $2, 'member', 'Basic task access', $7)`,
      [
        adminRoleId,
        tenant1Id,
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
          'task:read:all', 'task:update:all', 'task:delete:all',
          'user:create', 'user:read', 'user:update', 'user:delete', 'user:read:all',
          'org:update', 'org:settings', 'activity:read', 'activity:read:all'
        ]),
        managerRoleId,
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
          'task:read:all', 'task:update:all',
          'user:read', 'user:read:all', 'activity:read'
        ]),
        memberRoleId,
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete',
          'user:read', 'activity:read'
        ])
      ]
    );

    // Create roles for tenant 2
    const admin2RoleId = uuidv4();
    const manager2RoleId = uuidv4();
    const member2RoleId = uuidv4();

    await client.query(
      `INSERT INTO roles (id, tenant_id, name, description, permissions) VALUES
       ($1, $2, 'admin', 'Full system access', $3),
       ($4, $2, 'manager', 'Manage team and tasks', $5),
       ($6, $2, 'member', 'Basic task access', $7)`,
      [
        admin2RoleId,
        tenant2Id,
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
          'task:read:all', 'task:update:all', 'task:delete:all',
          'user:create', 'user:read', 'user:update', 'user:delete', 'user:read:all',
          'org:update', 'org:settings', 'activity:read', 'activity:read:all'
        ]),
        manager2RoleId,
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
          'task:read:all', 'task:update:all',
          'user:read', 'user:read:all', 'activity:read'
        ]),
        member2RoleId,
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete',
          'user:read', 'activity:read'
        ])
      ]
    );

    logger.info('Created roles');

    // Create sample users
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const admin1Id = uuidv4();
    const manager1Id = uuidv4();
    const member1Id = uuidv4();
    const member2Id = uuidv4();

    await client.query(
      `INSERT INTO users (id, tenant_id, email, first_name, last_name, password, role_id, is_active) VALUES
       ($1, $2, 'admin@acme.com', 'John', 'Admin', $3, $4, true),
       ($5, $2, 'manager@acme.com', 'Sarah', 'Manager', $3, $6, true),
       ($7, $2, 'alice@acme.com', 'Alice', 'Johnson', $3, $8, true),
       ($9, $2, 'bob@acme.com', 'Bob', 'Smith', $3, $8, true)`,
      [
        admin1Id, tenant1Id, hashedPassword, adminRoleId,
        manager1Id, managerRoleId,
        member1Id, memberRoleId,
        member2Id
      ]
    );

    // Create users for tenant 2
    const admin2Id = uuidv4();
    await client.query(
      `INSERT INTO users (id, tenant_id, email, first_name, last_name, password, role_id, is_active) VALUES
       ($1, $2, 'admin@techstart.com', 'Jane', 'Doe', $3, $4, true)`,
      [admin2Id, tenant2Id, hashedPassword, admin2RoleId]
    );

    logger.info('Created sample users');

    // Create sample tasks
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await client.query(
      `INSERT INTO tasks (tenant_id, title, description, status, priority, assigned_to, created_by, due_date) VALUES
       ($1, 'Setup project repository', 'Initialize Git repository and setup CI/CD pipeline', 'completed', 'high', $2, $3, $4),
       ($1, 'Design database schema', 'Create ERD and design normalized database schema', 'completed', 'high', $2, $3, $4),
       ($1, 'Implement authentication', 'Add JWT-based authentication with OAuth support', 'in_progress', 'urgent', $5, $3, $6),
       ($1, 'Create API documentation', 'Document all REST endpoints using Swagger', 'todo', 'medium', $5, $3, $7),
       ($1, 'Build frontend dashboard', 'Create React dashboard with task management UI', 'in_progress', 'high', $8, $3, $6),
       ($1, 'Write unit tests', 'Add comprehensive test coverage for all modules', 'todo', 'medium', $8, $5, $7),
       ($1, 'Setup Docker containers', 'Dockerize application and create docker-compose', 'todo', 'low', NULL, $3, $7),
       ($1, 'Implement real-time updates', 'Add WebSocket support for live notifications', 'todo', 'medium', NULL, $5, $7)`,
      [
        tenant1Id, member1Id, admin1Id, now,
        manager1Id, tomorrow, nextWeek,
        member2Id
      ]
    );

    logger.info('Created sample tasks');

    // Create sample activity logs
    await client.query(
      `INSERT INTO activity_logs (tenant_id, user_id, entity_type, entity_id, action, changes) 
       SELECT $1, $2, 'task', id, 'create', '{"status": "todo"}'::jsonb 
       FROM tasks WHERE tenant_id = $1 LIMIT 3`,
      [tenant1Id, admin1Id]
    );

    logger.info('Created sample activity logs');

    // Create sample notifications
    await client.query(
      `INSERT INTO notifications (tenant_id, user_id, type, title, message, entity_type, entity_id) 
       SELECT $1, assigned_to, 'task_assigned', 'New Task Assigned', 
              'You have been assigned to: ' || title, 'task', id
       FROM tasks WHERE tenant_id = $1 AND assigned_to IS NOT NULL`,
      [tenant1Id]
    );

    logger.info('Created sample notifications');

    await client.query('COMMIT');
    logger.info('Database seeding completed successfully!');
    logger.info('');
    logger.info('Sample Credentials:');
    logger.info('===================');
    logger.info('Tenant: Acme Corporation');
    logger.info('Admin: admin@acme.com / Password123!');
    logger.info('Manager: manager@acme.com / Password123!');
    logger.info('Member: alice@acme.com / Password123!');
    logger.info('Member: bob@acme.com / Password123!');
    logger.info('');
    logger.info('Tenant: TechStart Inc');
    logger.info('Admin: admin@techstart.com / Password123!');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
