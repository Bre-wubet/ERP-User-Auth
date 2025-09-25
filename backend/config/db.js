import { PrismaClient } from '../generated/prisma/index.js';

/**
 * Database configuration and Prisma client instance (functional singleton)
 * Preserves db.client API used across the codebase.
 */

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

const connect = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Database disconnection failed:', error);
    throw error;
  }
};

const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Export object with the same shape as before: db.client
export const db = {
  client: prisma,
  connect,
  disconnect,
  healthCheck,
};

export default db;
