import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { hasPermission } from '../middleware/rbac.middleware';
import { validateTenant, injectTenantId } from '../middleware/tenant.middleware';
import { logActivity } from '../middleware/activity-logger.middleware';
import { Permission, ActivityAction } from '../types';
import {
  createTaskValidator,
  updateTaskValidator,
  getTasksValidator,
  taskIdValidator,
} from '../validators/task.validator';

/**
 * Task Routes
 */
const router = Router();
const taskController = new TaskController();

// All routes require authentication and tenant validation
router.use(authenticate);
router.use(validateTenant);

// Get task statistics
router.get('/stats', taskController.getStatistics);

// CRUD operations
router.post(
  '/',
  hasPermission(Permission.TASK_CREATE),
  injectTenantId,
  validate(createTaskValidator),
  logActivity('task', ActivityAction.CREATE),
  taskController.createTask
);

router.get(
  '/',
  hasPermission(Permission.TASK_READ),
  validate(getTasksValidator),
  taskController.getTasks
);

router.get(
  '/:id',
  hasPermission(Permission.TASK_READ),
  validate(taskIdValidator),
  taskController.getTaskById
);

router.put(
  '/:id',
  hasPermission(Permission.TASK_UPDATE),
  validate(updateTaskValidator),
  logActivity('task', ActivityAction.UPDATE),
  taskController.updateTask
);

router.delete(
  '/:id',
  hasPermission(Permission.TASK_DELETE),
  validate(taskIdValidator),
  logActivity('task', ActivityAction.DELETE),
  taskController.deleteTask
);

export default router;
