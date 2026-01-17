import { FastifyRequest, FastifyReply } from 'fastify';
import { log } from '../lib/logger';
import { AuthorizationError, sendError } from '../utils/responses';

// Security headers middleware - use non-async for hooks
export const securityHeaders = (_request: FastifyRequest, reply: FastifyReply, done: () => void) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  done();
};

// Request logging middleware
export const requestLogger = async (request: FastifyRequest, reply: FastifyReply) => {
  const start = Date.now();

  // Use Node's finish event to log when reply is sent
  reply.raw.once('finish', () => {
    const responseTime = Date.now() - start;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip;

    log.request(
      request.method,
      request.url,
      reply.statusCode,
      responseTime,
      {
        ip,
        userAgent,
        userId: (request as any).user?.userId,
      }
    );
  });
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const clientIP = request.ip;

    if (!allowedIPs.includes(clientIP)) {
      log.security('IP_ACCESS_DENIED', { ip: clientIP, url: request.url });
      return sendError(reply, new AuthorizationError('Access denied from this IP address'), request.id);
    }
  };
};

// Suspicious activity detection
export const suspiciousActivityDetector = () => {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection
    /<script|javascript:|on\w+=/i, // XSS attempts
    /\.{2}/g, // Path traversal
    /\b(admin|root|administrator)\b/i, // Admin enumeration
  ];

  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const requestData = JSON.stringify({
      url: request.url,
      query: request.query,
      body: request.body,
      headers: request.headers,
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestData)) {
        log.security('SUSPICIOUS_ACTIVITY_DETECTED', {
          ip: request.ip,
          url: request.url,
          pattern: pattern.source,
          userAgent: request.headers['user-agent'],
          userId: (request as any).user?.userId,
        });

        // Don't block immediately, just log for analysis
        break;
      }
    }
  };
};

// CORS configuration
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
    // Build allowed origins from environment variables
    const baseOrigins = process.env['CORS_ORIGINS'] || 'http://localhost:3002,http://localhost:4000,http://localhost:3003';
    const allowedOrigins = baseOrigins.split(',').map(o => o.trim());

    // Add ngrok URLs if provided (for hybrid deployment)
    if (process.env['NGROK_BACKEND_URL']) {
      allowedOrigins.push(process.env['NGROK_BACKEND_URL']);
    }
    if (process.env['NGROK_ADMIN_URL']) {
      allowedOrigins.push(process.env['NGROK_ADMIN_URL']);
    }
    if (process.env['NGROK_PORTAL_URL']) {
      allowedOrigins.push(process.env['NGROK_PORTAL_URL']);
    }
    if (process.env['CORPORATE_URL']) {
      allowedOrigins.push(process.env['CORPORATE_URL']);
    }

    // Allow requests with no origin (curl, Postman, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      log.security('CORS_VIOLATION', { origin, allowedOrigins });
      // In development, allow anyway but log
      if (process.env['NODE_ENV'] === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Content Security Policy
export const cspHeader = (_request: FastifyRequest, reply: FastifyReply, done: () => void) => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  reply.header('Content-Security-Policy', csp);
  done();
};