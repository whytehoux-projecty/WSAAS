import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getTransactions, createTransfer } from './transactions';

export default async function transferRoutes(fastify: FastifyInstance) {
    // Get transfers history
    fastify.get(
        '/',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Get transfer history',
                tags: ['Transfers'],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1, default: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                        accountId: { type: 'string' },
                        startDate: { type: 'string', format: 'date' },
                        endDate: { type: 'string', format: 'date' },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            // Force type parameter to TRANSFER
            (request.query as any).type = 'TRANSFER';
            return getTransactions(request, reply);
        }
    );

    // Create new transfer
    // We reuse the existing createTransfer handler which handles validation internally
    fastify.post(
        '/',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Create a new transfer',
                tags: ['Transfers'],
                body: {
                    type: 'object',
                    required: ['fromAccountId', 'amount', 'description'],
                    properties: {
                        fromAccountId: { type: 'string' },
                        toAccountId: { type: 'string' },
                        toAccountNumber: { type: 'string' },
                        amount: { type: 'number', minimum: 0.01 },
                        currency: { type: 'string', default: 'USD' },
                        description: { type: 'string', minLength: 1 },
                        reference: { type: 'string' },
                        category: { type: 'string' },
                    },
                },
            },
        },
        createTransfer
    );
}
