import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { AuthRequest, TaskFilters, PaginationParams } from '../types';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Task Controller
 * Handles HTTP requests for task management
 */
export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * Create new task
   * POST /api/v1/tasks
   */
  createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user!.id;
      const taskData = req.body;

      console.log('📝 Create Task Request:');
      console.log('  Tenant ID:', tenantId);
      console.log('  User ID:', userId);
      console.log('  User Object:', req.user);
      console.log('  Request Body:', JSON.stringify(taskData, null, 2));
      console.log('  Body Keys:', Object.keys(taskData));

      // Validate required fields
      if (!taskData.title) {
        console.error('❌ Missing required field: title');
        return res.status(400).json({
          success: false,
          message: 'Title is required',
        });
      }

      const task = await this.taskService.createTask(tenantId, userId, taskData);

      console.log('✅ Task created successfully:', task.id);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      console.error('❌ Error in createTask controller:', error);
      throw error;
    }
  });

  /**
   * Get all tasks with filters
   * GET /api/v1/tasks
   */
  getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user!.id;
      const userPermissions = (req.user as any).permissions || [];

      console.log('📋 Get Tasks Request:');
      console.log('  Tenant ID:', tenantId);
      console.log('  User ID:', userId);
      console.log('  User:', req.user);
      console.log('  Query:', req.query);

      // Parse filters
      const filters: TaskFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        assignedTo: req.query.assignedTo as string,
        createdBy: req.query.createdBy as string,
        search: req.query.search as string,
      };

      // Parse pagination
      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
      };

      console.log('  Filters:', filters);
      console.log('  Pagination:', pagination);

      const result = await this.taskService.getTasks(
        tenantId,
        userId,
        userPermissions,
        filters,
        pagination
      );

      console.log('✅ Tasks loaded:', result.tasks.length);

      res.json({
        success: true,
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error('❌ Error in getTasks:', error);
      throw error;
    }
  });

  /**
   * Get task by ID
   * GET /api/v1/tasks/:id
   */
  getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = req.params.id;
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const userPermissions = (req.user as any).permissions || [];

    const task = await this.taskService.getTaskById(taskId, tenantId, userId, userPermissions);

    res.json({
      success: true,
      data: task,
    });
  });

  /**
   * Update task
   * PUT /api/v1/tasks/:id
   */
  updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = req.params.id;
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const userPermissions = (req.user as any).permissions || [];
    const updates = req.body;

    const task = await this.taskService.updateTask(
      taskId,
      tenantId,
      userId,
      updates,
      userPermissions
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  });

  /**
   * Delete task
   * DELETE /api/v1/tasks/:id
   */
  deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = req.params.id;
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const userPermissions = (req.user as any).permissions || [];

    await this.taskService.deleteTask(taskId, tenantId, userId, userPermissions);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  });

  /**
   * Get task statistics
   * GET /api/v1/tasks/stats
   */
  getStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const userPermissions = (req.user as any).permissions || [];

    console.log('📊 Get Statistics Request:');
    console.log('  Tenant ID:', tenantId);
    console.log('  User ID:', userId);

    const stats = await this.taskService.getStatistics(tenantId, userId, userPermissions);

    console.log('✅ Statistics loaded:', stats);

    res.json({
      success: true,
      data: stats,
    });
  });
}
