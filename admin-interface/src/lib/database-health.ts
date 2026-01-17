import { PrismaClient } from "@prisma/client";

export class DatabaseHealthCheck {
  private static instance: DatabaseHealthCheck;
  private prisma: PrismaClient;
  private lastHealthCheck: Date | null = null;
  private isHealthy: boolean = false;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DatabaseHealthCheck {
    if (!DatabaseHealthCheck.instance) {
      DatabaseHealthCheck.instance = new DatabaseHealthCheck();
    }
    return DatabaseHealthCheck.instance;
  }

  public async checkHealth(): Promise<{
    status: "healthy" | "unhealthy";
    lastCheck: Date;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Simple query to test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;
      this.lastHealthCheck = new Date();
      this.isHealthy = true;

      return {
        status: "healthy",
        lastCheck: this.lastHealthCheck,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.lastHealthCheck = new Date();
      this.isHealthy = false;

      return {
        status: "unhealthy",
        lastCheck: this.lastHealthCheck,
        responseTime,
        error:
          error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }

  public async getConnectionInfo(): Promise<{
    activeConnections: number;
    maxConnections: number;
    databaseVersion?: string;
  }> {
    try {
      // Get database version
      const versionResult = await this.prisma.$queryRaw<
        Array<{ version: string }>
      >`
        SELECT version() as version
      `;

      // Get connection info (PostgreSQL specific)
      const connectionResult = await this.prisma.$queryRaw<
        Array<{
          active_connections: number;
          max_connections: number;
        }>
      >`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity) as active_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      `;

      return {
        activeConnections: connectionResult[0]?.active_connections || 0,
        maxConnections: connectionResult[0]?.max_connections || 0,
        ...(versionResult[0]?.version && {
          databaseVersion: versionResult[0].version,
        }),
      };
    } catch (error) {
      // Fallback for non-PostgreSQL databases or permission issues
      return {
        activeConnections: 0,
        maxConnections: 0,
        databaseVersion: "Unknown",
      };
    }
  }

  public getLastHealthStatus(): {
    isHealthy: boolean;
    lastCheck: Date | null;
  } {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
    };
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
