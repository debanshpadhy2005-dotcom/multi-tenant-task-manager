import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

/**
 * Main Router
 * Combines all route modules
 */
const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskMaster API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;
