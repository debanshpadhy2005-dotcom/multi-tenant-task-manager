import { TaskRepository } from '../repositories/task.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { ITask, TaskFilters, PaginationParams, NotificationType } from '../types';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

/**
 * Task Service
 * Handles task business logic
 */
export class TaskService {
  private taskRepository: TaskRepository;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.notificationRepository = new NotificationRepository();
  }

  /**
   * Create new task
   */
  async createTask(
    tenantId: string,
    userId: string,
    taskData: Partial<ITask>
  ): Promise<ITask> {
    console.log('🔷 Task Service - Creating task:');
    console.log('  Tenant ID:', tenantId);
    console.log('  User ID:', userId);
    console.log('  Task Data:', taskData);

    const task = await this.taskRepository.create({
      ...taskData,
      tenantId,
      createdBy: userId,
    });

    console.log('🔷 Task Service - Task created:', task);

    // Create notification if task is assigned
    if (task.assignedTo && task.assignedTo !== userId) {
      await this.notificationRepository.create({
        tenantId,
        userId: task.assignedTo,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: `You have been assigned to: ${task.title}`,
        entityType: 'task',
        entityId: task.id,
      });
    }

    logger.info(`Task created: ${task.id} by user ${userId}`);
    return task;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    tenantId: string,
    userId: string,
    updates: Partial<ITask>,
    userPermissions: string[]
  ): Promise<ITask> {
    const task = await this.taskRepository.findByIdWithDetails(taskId, tenantId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check permissions
    const canUpdateAll = userPermissions.includes('task:update:all');
    const isOwner = task.createdBy === userId || task.assignedTo === userId;

    if (!canUpdateAll && !isOwner) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    const updatedTask = await this.taskRepository.update(taskId, tenantId, updates);
    if (!updatedTask) {
      throw new AppError('Failed to update task', 500);
    }

    // Create notification if assignee changed
    if (updates.assignedTo && updates.assignedTo !== task.assignedTo) {
      await this.notificationRepository.create({
        tenantId,
        userId: updates.assignedTo,
        type: NotificationType.TASK_ASSIGNED,
        title: 'Task Assigned to You',
        message: `You have been assigned to: ${updatedTask.title}`,
        entityType: 'task',
        entityId: updatedTask.id,
      });
    }

    // Create notification if status changed to completed
    if (updates.status === 'completed' && task.status !== 'completed') {
      if (task.createdBy !== userId) {
        await this.notificationRepository.create({
          tenantId,
          userId: task.createdBy,
          type: NotificationType.TASK_COMPLETED,
          title: 'Task Completed',
          message: `Task "${updatedTask.title}" has been completed`,
          entityType: 'task',
          entityId: updatedTask.id,
        });
      }
    }

    logger.info(`Task updated: ${taskId} by user ${userId}`);
    return updatedTask;
  }

  /**
   * Delete task
   */
  async deleteTask(
    taskId: string,
    tenantId: string,
    userId: string,
    userPermissions: string[]
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId, tenantId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check permissions
    const canDeleteAll = userPermissions.includes('task:delete:all');
    const isCreator = task.createdBy === userId;

    if (!canDeleteAll && !isCreator) {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await this.taskRepository.softDelete(taskId, tenantId);
    logger.info(`Task deleted: ${taskId} by user ${userId}`);
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string, tenantId: string, userId: string, userPermissions: string[]): Promise<ITask> {
    const task = await this.taskRepository.findByIdWithDetails(taskId, tenantId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check permissions
    const canReadAll = userPermissions.includes('task:read:all');
    const isRelated = task.createdBy === userId || task.assignedTo === userId;

    if (!canReadAll && !isRelated) {
      throw new AppError('You do not have permission to view this task', 403);
    }

    return task;
  }

  /**
   * Get tasks with filters
   */
  async getTasks(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    filters: TaskFilters,
    pagination: PaginationParams
  ): Promise<{ tasks: ITask[]; total: number; page: number; totalPages: number }> {
    // If user doesn't have read:all permission, filter by their tasks only
    const canReadAll = userPermissions.includes('task:read:all');
    if (!canReadAll) {
      // Show tasks created by or assigned to the user
      if (!filters.createdBy && !filters.assignedTo) {
        filters.createdBy = userId;
        // Note: This is simplified. In production, you'd want to show tasks where user is creator OR assignee
      }
    }

    const { tasks, total } = await this.taskRepository.findWithFilters(
      tenantId,
      filters,
      pagination
    );

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      tasks,
      total,
      page: pagination.page,
      totalPages,
    };
  }

  /**
   * Get task statistics
   */
  async getStatistics(tenantId: string, userId: string, userPermissions: string[]): Promise<any> {
    const canReadAll = userPermissions.includes('task:read:all');
    const stats = await this.taskRepository.getStatistics(
      tenantId,
      canReadAll ? undefined : userId
    );
    return stats;
  }
}
