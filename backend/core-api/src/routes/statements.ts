import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { StatementService } from '../services/statement.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const statementService = new StatementService();

export default async function statementRoutes(fastify: FastifyInstance) {
    // List statements
    fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;

        try {
            const statements = await prisma.statement.findMany({
                where: {
                    account: {
                        userId: user.userId
                    }
                },
                include: {
                    account: {
                        select: { accountNumber: true, accountType: true }
                    }
                },
                orderBy: { generatedAt: 'desc' }
            });

            reply.send({ statements });
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch statements' });
        }
    });

    // Generate statement (Manual trigger)
    fastify.post('/generate', async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;
        const { accountId, month, year } = request.body as any;

        try {
            // Verify ownership
            const account = await prisma.account.findFirst({
                where: { id: accountId, userId: user.userId }
            });

            if (!account) return reply.status(403).send({ error: 'Unauthorized access to account' });

            // Calculate period (Default to current month)
            const now = new Date();
            const m = month !== undefined ? month : now.getMonth();
            const y = year || now.getFullYear();

            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 0); // Last day of month

            const statement = await statementService.generateStatement(accountId, start, end);
            reply.send({ message: 'Statement generated successfully', statement });
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to generate statement' });
        }
    });

    // Download statement
    fastify.get('/:id/download', async (request: FastifyRequest, reply: FastifyReply) => {
        const user = (request as any).user;
        const { id } = request.params as any;

        try {
            const statement = await prisma.statement.findUnique({
                where: { id },
                include: { account: true }
            });

            if (!statement) return reply.status(404).send({ error: 'Statement not found' });
            if (statement.account.userId !== user.userId) return reply.status(403).send({ error: 'Unauthorized' });

            const uploadDir = path.join(process.cwd(), 'uploads', 'statements');
            const filePath = path.join(uploadDir, statement.filePath);

            if (!fs.existsSync(filePath)) {
                return reply.status(404).send({ error: 'Statement file not found on server' });
            }

            const stream = fs.createReadStream(filePath);
            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `attachment; filename="statement-${statement.periodStart.toISOString().split('T')[0]}.pdf"`);
            reply.send(stream);
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to download statement' });
        }
    });
}
