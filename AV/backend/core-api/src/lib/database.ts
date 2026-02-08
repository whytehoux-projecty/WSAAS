import { PrismaClient } from '@prisma/client';
import { createClient, RedisClientType } from 'redis';
import config from '../config/environment';

class DatabaseManager {
  private static instance: DatabaseManager;
  private _prisma: PrismaClient | null = null;
  private _redis: RedisClientType | null = null;

  private constructor() { }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient({
        log: config.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty',
      });
    }
    return this._prisma;
  }

  public get redis(): RedisClientType {
    if (!this._redis) {
      this._redis = createClient({
        url: config.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this._redis.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this._redis.on('connect', () => {
        console.log('Connected to Redis');
      });

      this._redis.on('reconnecting', () => {
        console.log('Reconnecting to Redis...');
      });
    }
    return this._redis;
  }

  public async connect(): Promise<void> {
    try {
      // Test Prisma connection
      await this.prisma.$connect();
      console.log('✅ Connected to database');

      // Connect to Redis (optional in development)
      // Skip Redis in development if SKIP_REDIS is set or if connection fails
      if (config.NODE_ENV === 'development' && process.env['SKIP_REDIS'] === 'true') {
        console.log('⚠️  Redis skipped (SKIP_REDIS=true)');
        return;
      }

      try {
        // Only try Redis if we're in production or explicitly requested
        if (config.NODE_ENV === 'production' || process.env['USE_REDIS'] === 'true') {
          if (!this.redis.isOpen) {
            await this.redis.connect();
            console.log('✅ Connected to Redis cache');
          }
        } else {
          console.log('⚠️  Redis skipped in development mode');
        }
      } catch (redisError) {
        if (config.NODE_ENV === 'development') {
          console.log('⚠️  Redis not available (optional in development)');
        } else {
          console.error('❌ Redis connection failed:', redisError);
          throw redisError;
        }
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this._prisma) {
        await this._prisma.$disconnect();
        console.log('✅ Disconnected from PostgreSQL database');
      }

      if (this._redis && this._redis.isOpen) {
        await this._redis.quit();
        console.log('✅ Disconnected from Redis cache');
      }
    } catch (error) {
      console.error('❌ Error during database disconnection:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{
    database: 'connected' | 'disconnected';
    cache: 'connected' | 'disconnected';
  }> {
    const result: { database: 'connected' | 'disconnected'; cache: 'connected' | 'disconnected' } = {
      database: 'disconnected',
      cache: 'disconnected',
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.database = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      if (this._redis && this._redis.isOpen) {
        await this.redis.ping();
        result.cache = 'connected';
      } else if (config.NODE_ENV === 'development') {
        // In development, Redis is optional
        result.cache = 'disconnected';
      }
    } catch (error) {
      if (config.NODE_ENV !== 'development') {
        console.error('Redis health check failed:', error);
      }
    }

    return result;
  }
}

export const db = DatabaseManager.getInstance();
export default db;
