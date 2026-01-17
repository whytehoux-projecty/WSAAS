import { FastifyRequest, FastifyReply } from "fastify";

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip: string;
  userId?: string;
  adminUserId?: string;
}

export function performanceMonitoring() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();

    // Add request ID if not present
    if (!request.id) {
      request.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Store start time for later use
    (request as any).startTime = startTime;

    // Add performance headers immediately
    reply.header("X-Request-ID", request.id);
  };
}

// Function to be used in onSend hook at the server level
export function logPerformanceMetrics(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = (request as any).startTime || Date.now();
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  const metrics: PerformanceMetrics = {
    requestId: request.id,
    method: request.method,
    path: request.url,
    statusCode: reply.statusCode,
    responseTime,
    timestamp: new Date(startTime),
    userAgent: request.headers["user-agent"] || "unknown",
    ip: request.ip,
    // Add user context if available
    userId: (request as any).user?.id,
    adminUserId: (request as any).adminUser?.id,
  };

  // Log performance metrics
  const logLevel =
    responseTime > 1000 ? "warn" : responseTime > 500 ? "info" : "debug";
  request.log[logLevel](
    {
      performance: metrics,
    },
    `Request completed in ${responseTime}ms`
  );

  // Add response time header
  reply.header("X-Response-Time", `${responseTime}ms`);
}

// Health check with system metrics
export async function getSystemHealth() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
  };
}
