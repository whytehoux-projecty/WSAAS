import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export async function authenticateWeb(request: FastifyRequest, reply: FastifyReply) {
  // Production web authentication implementation
  try {
    const token = request.cookies['admin_token'];

    if (!token) {
      return reply.redirect('/login');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.status !== 'ACTIVE') {
      return reply.redirect('/login?error=invalid_session');
    }

    // Attach user to request
    (request as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions
    };

  } catch (error) {
    console.error('Web authentication error:', error);
    return reply.redirect('/login?error=invalid_token');
  }
}

export async function redirectIfAuthenticated(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies['admin_token'];

    if (token) {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Check if user exists and is active
      const user = await prisma.adminUser.findUnique({
        where: { id: decoded.userId }
      });

      if (user && user.status === 'ACTIVE') {
        return reply.redirect('/dashboard');
      }
    }
  } catch (error) {
    // Token is invalid, clear it and continue
    reply.clearCookie('admin_token', { path: '/' });
  }
}