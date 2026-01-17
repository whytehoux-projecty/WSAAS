import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

export default async function authRoutes(fastify: FastifyInstance) {
  // Form-based login (for web interface)
  fastify.post('/form-login', AuthController.formLogin);

  // Form-based logout (for web interface)
  fastify.post('/form-logout', AuthController.formLogout);

  // API Login
  fastify.post('/login', AuthController.login);

  // API Logout
  fastify.post('/logout', { preHandler: authenticateToken }, AuthController.logout);

  // Get current admin profile
  fastify.get('/profile', { preHandler: authenticateToken }, AuthController.getProfile);

  // Update admin profile
  fastify.put('/profile', { preHandler: authenticateToken }, AuthController.updateProfile);

  // Change password
  fastify.put('/change-password', { preHandler: authenticateToken }, AuthController.changePassword);

  // Verify token
  fastify.get('/verify', { preHandler: authenticateToken }, AuthController.verifyToken);
}