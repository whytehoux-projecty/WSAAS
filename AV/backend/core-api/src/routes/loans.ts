
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { LoanService } from '../services/loan.service';
import { PrismaClient } from '@prisma/client';

const loanService = new LoanService();
const prisma = new PrismaClient();

const createLoanSchema = z.object({
    accountId: z.string(),
    amount: z.number().positive(),
    interestRate: z.number().min(0),
    termMonths: z.number().int().positive(),
    startDate: z.string().datetime().optional() // ISO String
});

const repaymentSchema = z.object({
    accountId: z.string(),
    amount: z.number().positive()
});

export default async function loanRoutes(fastify: FastifyInstance) {
    // Get all user loans
    fastify.get('/', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = (request as any).user;

        try {
            const loans = await prisma.loan.findMany({
                where: { userId: user.userId },
                orderBy: { createdAt: 'desc' }
            });
            reply.send({ loans });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch loans' });
        }
    });

    // Create Loan (Application)
    fastify.post('/', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = (request as any).user;
        try {
            const body = createLoanSchema.parse(request.body);

            const loan = await loanService.createLoan({
                userId: user.userId,
                accountId: body.accountId,
                amount: body.amount,
                interestRate: body.interestRate,
                termMonths: body.termMonths,
                startDate: body.startDate ? new Date(body.startDate) : new Date()
            });

            reply.status(201).send({ message: 'Loan created successfully', loan });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Validation Error', details: error.errors });
            }
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to create loan' });
        }
    });

    // Get Loan Details
    fastify.get('/:id', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };

        try {
            const loan = await loanService.getLoan(id, user.userId);
            if (!loan) return reply.status(404).send({ error: 'Loan not found' });

            reply.send({ loan });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to details' });
        }
    });

    // Make Repayment
    fastify.post('/:id/repayment', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };

        try {
            const body = repaymentSchema.parse(request.body);

            const result = await loanService.processRepayment({
                loanId: id,
                userId: user.userId,
                amount: body.amount,
                accountId: body.accountId
            });

            reply.send({ message: 'Repayment successful', result });
        } catch (error) {
            if (error instanceof z.ZodError) return reply.status(400).send({ error: error.errors });
            request.log.error(error);
            // Handle specific errors like 'Insufficient funds'
            const msg = (error as Error).message;
            if (msg === 'Insufficient funds' || msg === 'Account not found') {
                return reply.status(400).send({ error: msg });
            }
            reply.status(500).send({ error: 'Repayment failed' });
        }
    });

    // Download History PDF
    fastify.get('/:id/history/pdf', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };

        try {
            const pdfBuffer = await loanService.generateHistoryPDF(id, user.userId);

            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `attachment; filename="loan-${id}-history.pdf"`);
            reply.send(pdfBuffer);
        } catch (error) {
            request.log.error(error);
            const msg = (error as Error).message;
            if (msg === 'Loan not found') return reply.status(404).send({ error: msg });
            reply.status(500).send({ error: 'Failed to generate PDF' });
        }
    });
}
