import { PrismaClient } from '../generated/prisma/index.js';

/**
 * Database configuration and Prisma client instance
 * Uses singleton pattern to prevent multiple connections
 */
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });

    Database.instance = this;
  }

  /**
   * Connect to the database
   */
  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  get client() {
    return this.prisma;
  }

  /**
   * Health check for database connection
   */
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Export singleton instance
export const db = new Database();
export default db;
