import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableFrameGuard: boolean;
  enableContentTypeNoSniff: boolean;
  enableReferrerPolicy: boolean;
  cspDirectives?: Record<string, string[]>;
}

export function configureSecurityHeaders(
  fastify: FastifyInstance,
  config: SecurityConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableFrameGuard: true,
    enableContentTypeNoSniff: true,
    enableReferrerPolicy: true,
  }
) {
  // Content Security Policy
  if (config.enableCSP) {
    const defaultCSP = {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      upgradeInsecureRequests: [],
    };

    const cspDirectives = { ...defaultCSP, ...config.cspDirectives };
    
    fastify.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload: any) => {
      const cspString = Object.entries(cspDirectives)
        .map(([directive, sources]) => {
          const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
          return sources.length > 0 ? `${kebabDirective} ${sources.join(' ')}` : kebabDirective;
        })
        .join('; ');
      
      reply.header('Content-Security-Policy', cspString);
      return payload;
    });
  }

  // HTTP Strict Transport Security
  if (config.enableHSTS && process.env.NODE_ENV === 'production') {
    fastify.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload: any) => {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      return payload;
    });
  }

  // X-XSS-Protection
  if (config.enableXSSProtection) {
    fastify.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload: any) => {
      reply.header('X-XSS-Protection', '1; mode=block');
      return payload;
    });
  }

  // X-Frame-Options
  if (config.enableFrameGuard) {
    fastify.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload: any) => {
      reply.header('X-Frame-Options', 'DENY');
      return payload;
    });
  }

  // X-Content-Type-Options
  if (config.enableContentTypeNoSniff) {
    fastify.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload: any) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      return payload;
    });
  }

  // Referrer-Policy
  if (config.enableReferrerPolicy) {
    fastify.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload: any) => {
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      return payload;
    });
  }

  // Additional security headers
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    // Remove server information
    reply.removeHeader('X-Powered-By');
    reply.removeHeader('Server');
    
    // Add custom security headers
    reply.header('X-DNS-Prefetch-Control', 'off');
    reply.header('X-Download-Options', 'noopen');
    reply.header('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Cache control for sensitive endpoints
    if (request.url.includes('/api/admin') || request.url.includes('/api/auth')) {
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
    }
    
    return payload;
  });
}