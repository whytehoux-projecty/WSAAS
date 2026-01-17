import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const addPayeeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    category: z.string().min(1, 'Category is required'),
});

const payBillSchema = z.object({
    payeeId: z.string(),
    amount: z.number().positive(),
    accountId: z.string(),
    paymentDate: z.string().or(z.date()), // Optional scheduling support
});

export const getPayees = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const payees = await prisma.billPayee.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
        });
        reply.send({ payees });
    } catch (error) {
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to fetch payees' });
    }
};

export const addPayee = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const data = addPayeeSchema.parse(request.body);

        const payee = await prisma.billPayee.create({
            data: {
                userId: user.userId,
                ...data,
            },
        });

        reply.status(201).send({ message: 'Payee added', payee });
    } catch (error) {
        if (error instanceof z.ZodError) return reply.status(400).send({ error: 'Validation Error', message: error.errors[0]?.message });
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to add payee' });
    }
};

export const payBill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const { payeeId, amount, accountId } = payBillSchema.parse(request.body);

        // Verify account
        const account = await prisma.account.findFirst({
            where: { id: accountId, userId: user.userId },
        });
        if (!account) return reply.status(404).send({ message: 'Account not found' });

        if (account.balance.lt(amount)) return reply.status(400).send({ message: 'Insufficient funds' });

        // Verify payee
        const payee = await prisma.billPayee.findFirst({
            where: { id: payeeId, userId: user.userId },
        });
        if (!payee) return reply.status(404).send({ message: 'Payee not found' });

        const transaction = await prisma.$transaction(async (tx) => {
            // Deduct
            await tx.account.update({
                where: { id: accountId },
                data: { balance: { decrement: amount } },
            });

            // Create transaction
            return tx.transaction.create({
                data: {
                    accountId,
                    type: 'PAYMENT',
                    amount: - amount, // Negative for outflow
                    currency: account.currency,
                    status: 'COMPLETED',
                    category: payee.category, // Auto-categorize
                    description: `Bill Payment to ${payee.name}`,
                    reference: `BP-${Date.now()}`,
                    processedAt: new Date(),
                },
            });
        });

        reply.send({ message: 'Payment successful', transaction });

    } catch (error) {
        if (error instanceof z.ZodError) return reply.status(400).send({ error: 'Validation Error', message: error.errors[0]?.message });
        request.log.error('Pay bill error:', error);
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to process payment' });
    }
};
