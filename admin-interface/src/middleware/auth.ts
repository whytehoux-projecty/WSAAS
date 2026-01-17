import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { JWT_SECRET } from '../config/constants';
import type { FastifyReply, FastifyRequest } from 'fastify';

// Augment FastifyRequest to include optional user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      permissions?: string[];
    };
  }
}

export const authenticateWeb = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cookieToken = request.cookies?.['admin_token'];
    const headerVal = request.headers['x-admin-token'];
    const headerToken = Array.isArray(headerVal) ? headerVal[0] : headerVal;
    const token = cookieToken || headerToken;

    if (!token || typeof token !== 'string') {
      reply.redirect('/login');
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    request.user = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role,
      permissions: decoded.permissions || []
    };
  } catch (_err) {
    reply.redirect('/login');
    return;
  }
};

export const redirectIfAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cookieToken = request.cookies?.['admin_token'];
    const headerVal = request.headers['x-admin-token'];
    const headerToken = Array.isArray(headerVal) ? headerVal[0] : headerVal;
    const token = cookieToken || headerToken;

    if (!token || typeof token !== 'string') {
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.id) {
      reply.redirect('/dashboard');
      return;
    }
  } catch (_err) {
    // ignore
  }
};

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  // Production authentication implementation
  try {
    const token = (request as any).cookies['admin_token'] || (request.headers.authorization?.replace('Bearer ', ''));

    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    // Verify JWT
    jwt.verify(token, JWT_SECRET) as any;

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get user from database
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      return reply.status(401).send({ error: 'Invalid or inactive user' });
    }

    // Set user data on request
    request.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions ? user.permissions.split(',') : [],
    };

    return;
  } catch (error) {
    console.error('Authentication error:', error);
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

export function requireAdminRole(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  if (!request.user) {
    reply.status(401).send({ error: 'Authentication required' });
    return;
  }

  const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
  const role = request.user.role ?? '';
  if (!adminRoles.includes(role)) {
    reply.status(403).send({ error: 'Admin access required' });
    return;
  }

  done();
}

export function requireSuperAdminRole(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  if (!request.user) {
    reply.status(401).send({ error: 'Authentication required' });
    return;
  }

  if (request.user.role !== 'SUPER_ADMIN') {
    reply.status(403).send({ error: 'Super admin access required' });
    return;
  }

  done();
}

export function requirePermission(permission: string) {
  return (request: FastifyRequest, reply: FastifyReply, done: () => void): void => {
    if (!request.user) {
      reply.status(401).send({ error: 'Authentication required' });
      return;
    }

    const perms = request.user.permissions ?? [];
    const hasPermission = perms.includes('*') || perms.includes(permission);

    if (!hasPermission) {
      reply.status(403).send({ error: `Permission '${permission}' required` });
      return;
    }

    done();
  };
}

export async function rateLimitByIP(_request: FastifyRequest, _reply: FastifyReply) {
  // Placeholder implementation - no action needed for now
  return;
}