import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken, requireAdminRole } from '../middleware/auth';

export default async function adminRoutes(fastify: FastifyInstance) {
  // Apply authentication and admin role requirement to all routes
  fastify.addHook('preHandler', authenticateToken);
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    return requireAdminRole(request, reply, () => { });
  });

  // Dashboard statistics
  fastify.get('/dashboard/stats', AdminController.getDashboardStats);

  // User management
  fastify.get('/users', AdminController.getUsers);
  fastify.get('/users/:userId', AdminController.getUserById);
  fastify.put('/users/:userId/status', AdminController.updateUserStatus);
  fastify.put('/users/:userId/kyc-status', AdminController.updateKYCStatus);

  // Transaction management
  fastify.get('/transactions', AdminController.getTransactions);

  // Wire transfer management
  fastify.get('/wire-transfers', AdminController.getWireTransfers);
  fastify.put('/wire-transfers/:transferId/status', AdminController.updateWireTransferStatus);

  // Audit logs
  fastify.get('/audit-logs', AdminController.getAuditLogs);

  // Card management
  fastify.get('/cards', AdminController.getCards);

  // Bill payment management
  fastify.get('/bill-payees', AdminController.getBillPayees);
}