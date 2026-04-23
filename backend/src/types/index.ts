import { Request } from 'express';

/**
 * Core Type Definitions for the Application
 */

// User Types
export interface IUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roleId: string;
  isActive: boolean;
  isOAuthUser: boolean;
  oauthProvider?: string;
  oauthId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Role Types
export enum RoleType {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface IRole {
  id: string;
  tenantId: string;
  name: RoleType;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Tenant/Organization Types
export interface ITenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Task Types
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ITask {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdBy: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Activity Log Types
export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  STATUS_CHANGE = 'status_change',
  COMMENT = 'comment',
}

export interface IActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: ActivityAction;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Notification Types
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  MENTION = 'mention',
}

export interface INotification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
}

// Authentication Types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  roleId: string;
  roleName: RoleType;
}

// Extended Express Request with authenticated user
export interface AuthRequest extends Request {
  user?: IUser;
  tenantId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Filter Types
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  createdBy?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Permission Types
export enum Permission {
  // Task Permissions
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  TASK_READ_ALL = 'task:read:all',
  TASK_UPDATE_ALL = 'task:update:all',
  TASK_DELETE_ALL = 'task:delete:all',

  // User Permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_READ_ALL = 'user:read:all',

  // Organization Permissions
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',
  ORG_SETTINGS = 'org:settings',

  // Role Permissions
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',

  // Activity Log Permissions
  ACTIVITY_READ = 'activity:read',
  ACTIVITY_READ_ALL = 'activity:read:all',
}

// WebSocket Event Types
export enum SocketEvent {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_ASSIGNED = 'task:assigned',
  NOTIFICATION_NEW = 'notification:new',
}
