import { body, query, param } from 'express-validator';
import { TaskStatus, TaskPriority } from '../types';

/**
 * Task Validators
 */

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid priority'),
  
  body('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const updateTaskValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid task ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid priority'),
  
  body('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const getTasksValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  
  query('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid priority'),
  
  query('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  
  query('createdBy')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search query too long'),
  
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Invalid sort order'),
];

export const taskIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid task ID'),
];
