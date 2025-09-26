import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import database
import { db } from './config/db.js';

// Import middleware
import { errorHandler, notFound, securityErrorHandler, databaseErrorHandler } from './middlewares/errorMiddleware.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

// Load environment variables
dotenv.config();

/**
 * ERP User Authentication and Access Control Server
 * Main server configuration and startup
 */

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: dbHealth,
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.client.$queryRaw`SELECT 1`;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      version: '1.0.0',
      services: {
        database: 'connected',
        server: 'running'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      version: '1.0.0',
      services: {
        database: 'disconnected',
        server: 'running'
      },
      error: error.message
    };

    res.status(503).json(healthStatus);
  }
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/audit', auditRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ERP User Authentication and Access Control API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      audit: '/api/audit',
      health: '/api/health'
    },
    documentation: 'https://github.com/your-repo/erp-auth-api'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(securityErrorHandler);
app.use(databaseErrorHandler);
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await db.disconnect();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await db.connect();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`ERP Auth Server started`, {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
      });
      
      console.log(`
        ERP AUTH SERVER   
        Server running on port ${PORT}                             
        Environment: ${NODE_ENV.padEnd(20)} 
        Health check: http://localhost:${PORT}/health             
        API docs: http://localhost:${PORT}/api                     
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
