import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { TenantRepository } from '../repositories/tenant.repository';
import { generateTokens } from '../utils/jwt';
import { IUser, IAuthTokens, IJwtPayload, RoleType } from '../types';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';

/**
 * Authentication Service
 * Handles user authentication and authorization logic
 */
export class AuthService {
  private userRepository: UserRepository;
  private tenantRepository: TenantRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.tenantRepository = new TenantRepository();
  }

  /**
   * Register new organization with admin user
   */
  async register(data: {
    organizationName: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<{ user: IUser; tokens: IAuthTokens; tenant: any }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create organization slug
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existingTenant = await this.tenantRepository.findBySlug(slug);
    if (existingTenant) {
      throw new AppError('Organization name already taken', 400);
    }

    // Create tenant
    const tenant = await this.tenantRepository.create({
      name: data.organizationName,
      slug,
      settings: { theme: 'green' },
    });

    // Create admin role for this tenant
    const roleId = uuidv4();
    await pool.query(
      `INSERT INTO roles (id, tenant_id, name, description, permissions) VALUES ($1, $2, $3, $4, $5)`,
      [
        roleId,
        tenant.id,
        'admin',
        'Full system access',
        JSON.stringify([
          'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
          'task:read:all', 'task:update:all', 'task:delete:all',
          'user:create', 'user:read', 'user:update', 'user:delete', 'user:read:all',
          'org:update', 'org:settings', 'activity:read', 'activity:read:all'
        ]),
      ]
    );

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create admin user
    const user = await this.userRepository.create({
      tenantId: tenant.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      roleId,
      isActive: true,
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      roleId: roleId,
      roleName: RoleType.ADMIN,
    });

    logger.info(`New organization registered: ${tenant.name}`);

    return { user, tokens, tenant };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: IUser; tokens: IAuthTokens }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 401);
    }

    // Verify password
    if (!user.password) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id, user.tenantId);

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roleId: user.roleId,
      roleName: (user as any).role_name,
    });

    logger.info(`User logged in: ${user.email}`);

    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    const { verifyRefreshToken } = require('../utils/jwt');
    
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId, payload.tenantId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roleId: user.roleId,
      roleName: (user as any).role_name,
    });

    return tokens;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    tenantId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId, tenantId);
    if (!user || !user.password) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, tenantId, { password: hashedPassword });

    logger.info(`Password changed for user: ${user.email}`);
  }
}
