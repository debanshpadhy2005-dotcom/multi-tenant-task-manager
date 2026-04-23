import dotenv from 'dotenv';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { testConnection } from './config/database';
import { logger } from './utils/logger';
import { verifyAccessToken } from './utils/jwt';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Create HTTP server
    const httpServer: HTTPServer = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
    });

    // Setup WebSocket for real-time updates
    const allowedOrigins = process.env.FRONTEND_URL 
      ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001']
      : ['http://localhost:3000', 'http://localhost:3001'];

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // WebSocket authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket
      (socket as any).userId = payload.userId;
      (socket as any).tenantId = payload.tenantId;
      next();
    });

    // WebSocket connection handler
    io.on('connection', (socket) => {
      const userId = (socket as any).userId;
      const tenantId = (socket as any).tenantId;

      logger.info(`WebSocket client connected: ${userId}`);

      // Join tenant room for tenant-specific broadcasts
      socket.join(`tenant:${tenantId}`);
      socket.join(`user:${userId}`);

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${userId}`);
      });
    });

    // Make io available globally for broadcasting
    (global as any).io = io;

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server gracefully...');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
