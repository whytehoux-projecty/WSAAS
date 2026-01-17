import { PrismaClient, Prisma } from '@prisma/client';
import { RedisClientType } from 'redis';

export abstract class BaseService {
  protected db: PrismaClient;
  protected cache: RedisClientType;

  constructor(db: PrismaClient, cache: RedisClientType) {
    this.db = db;
    this.cache = cache;
  }

  // Cache helper methods
  protected async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.cache.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  protected async setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.cache.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  protected async deleteFromCache(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  protected async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.cache.keys(pattern);
      if (keys.length > 0) {
        await this.cache.del(keys);
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
    }
  }

  // Database transaction helper
  protected async withTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return await this.db.$transaction(async (tx) => callback(tx));
  }

  // Pagination helper
  protected getPaginationParams(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }

  // Search helper
  protected buildSearchFilter(searchTerm?: string, fields: string[] = []) {
    if (!searchTerm || fields.length === 0) return {};

    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })),
    };
  }

  // Date range filter helper
  protected buildDateRangeFilter(startDate?: string, endDate?: string, field: string = 'createdAt') {
    const filter: any = {};

    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) filter[field].gte = new Date(startDate);
      if (endDate) filter[field].lte = new Date(endDate);
    }

    return filter;
  }
}

// Service factory for dependency injection
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();

  private constructor(
    private db: PrismaClient,
    private cache: RedisClientType
  ) {}

  public static getInstance(db: PrismaClient, cache: RedisClientType): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(db, cache);
    }
    return ServiceFactory.instance;
  }

  public getService<T extends BaseService>(
    ServiceClass: new (db: PrismaClient, cache: RedisClientType) => T
  ): T {
    const serviceName = ServiceClass.name;
    
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, new ServiceClass(this.db, this.cache));
    }
    
    return this.services.get(serviceName);
  }
}

// Repository pattern base class
export abstract class BaseRepository<T> {
  protected db: PrismaClient;
  protected model: any;

  constructor(db: PrismaClient, model: any) {
    this.db = db;
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findMany(where: any = {}, options: any = {}): Promise<T[]> {
    return await this.model.findMany({ where, ...options });
  }

  async create(data: any): Promise<T> {
    return await this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({ where: { id } });
  }

  async count(where: any = {}): Promise<number> {
    return await this.model.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }
}