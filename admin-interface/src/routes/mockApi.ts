import { FastifyInstance } from 'fastify';

export default async function mockApiRoutes(fastify: FastifyInstance) {
  // Mock dashboard stats
  fastify.get('/api/dashboard/stats', async (_request, reply) => {
    return reply.send({
      totalUsers: 1247,
      activeUsers: 1156,
      pendingKYC: 23,
      totalAccounts: 2891,
      totalTransactions: 15678,
      totalWireTransfers: 234,
      pendingWireTransfers: 12,
      totalBalance: 45678901.23
    });
  });

  // Mock users list
  fastify.get('/api/users', async (_request, reply) => {
    const mockUsers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: 'ACTIVE',
        kycStatus: 'APPROVED',
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-01-20T14:22:00Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        status: 'ACTIVE',
        kycStatus: 'PENDING',
        createdAt: '2024-01-16T09:15:00Z',
        lastLoginAt: '2024-01-19T16:45:00Z'
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        status: 'INACTIVE',
        kycStatus: 'REJECTED',
        createdAt: '2024-01-14T11:20:00Z',
        lastLoginAt: '2024-01-18T08:30:00Z'
      }
    ];

    return reply.send({ users: mockUsers });
  });

  // Mock accounts list
  fastify.get('/api/accounts', async (_request, reply) => {
    const mockAccounts = [
      {
        id: '1',
        accountNumber: 'ACC001234567',
        accountType: 'CHECKING',
        balance: 15420.50,
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00Z',
        lastTransactionAt: '2024-01-20T14:22:00Z',
        user: {
          firstName: 'John',
          lastName: 'Doe'
        }
      },
      {
        id: '2',
        accountNumber: 'ACC001234568',
        accountType: 'SAVINGS',
        balance: 25000.00,
        status: 'ACTIVE',
        createdAt: '2024-01-16T09:15:00Z',
        lastTransactionAt: '2024-01-19T16:45:00Z',
        user: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      },
      {
        id: '3',
        accountNumber: 'ACC001234569',
        accountType: 'BUSINESS',
        balance: 75000.25,
        status: 'FROZEN',
        createdAt: '2024-01-14T11:20:00Z',
        lastTransactionAt: '2024-01-18T08:30:00Z',
        user: {
          firstName: 'Bob',
          lastName: 'Johnson'
        }
      }
    ];

    return reply.send({ accounts: mockAccounts });
  });

  // Mock transactions list
  fastify.get('/api/transactions', async (_request, reply) => {
    const mockTransactions = [
      {
        id: 'TXN001',
        type: 'DEPOSIT',
        amount: 1500.00,
        status: 'COMPLETED',
        description: 'Salary deposit',
        createdAt: '2024-01-20T14:22:00Z',
        fromAccount: null,
        toAccount: {
          accountNumber: 'ACC001234567'
        }
      },
      {
        id: 'TXN002',
        type: 'WITHDRAWAL',
        amount: 250.00,
        status: 'COMPLETED',
        description: 'ATM withdrawal',
        createdAt: '2024-01-20T12:15:00Z',
        fromAccount: {
          accountNumber: 'ACC001234567'
        },
        toAccount: null
      },
      {
        id: 'TXN003',
        type: 'TRANSFER',
        amount: 500.00,
        status: 'PENDING',
        description: 'Transfer to savings',
        createdAt: '2024-01-20T16:30:00Z',
        fromAccount: {
          accountNumber: 'ACC001234567'
        },
        toAccount: {
          accountNumber: 'ACC001234568'
        }
      }
    ];

    return reply.send({ transactions: mockTransactions });
  });

  // Mock transaction approval
  fastify.post('/api/transactions/:id/approve', async (_request, reply) => {
    return reply.send({ success: true, message: 'Transaction approved' });
  });

  // Mock transaction rejection
  fastify.post('/api/transactions/:id/reject', async (_request, reply) => {
    return reply.send({ success: true, message: 'Transaction rejected' });
  });

  // Mock transaction export
  fastify.get('/api/transactions/export', async (_request, reply) => {
    const csvData = `ID,Type,Amount,Status,Description,Date
TXN001,DEPOSIT,1500.00,COMPLETED,Salary deposit,2024-01-20
TXN002,WITHDRAWAL,250.00,COMPLETED,ATM withdrawal,2024-01-20
TXN003,TRANSFER,500.00,PENDING,Transfer to savings,2024-01-20`;

    return reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', 'attachment; filename="transactions.csv"')
      .send(csvData);
  });
}