import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createCardSchema = z.object({
    accountId: z.string(),
    cardType: z.enum(['DEBIT', 'CREDIT']),
});

const updateLimitsSchema = z.object({
    dailyLimit: z.number().positive().optional(),
    monthlyLimit: z.number().positive().optional(),
});

export const getCards = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;

        const cards = await prisma.card.findMany({
            where: {
                account: {
                    userId: user.userId,
                },
            },
            include: {
                account: {
                    select: {
                        accountNumber: true,
                        accountType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        reply.send({ cards });
    } catch (error) {
        request.log.error('Get cards error:', error);
        reply.status(500).send({
            error: 'Internal Server Error',
            message: 'Failed to fetch cards',
        });
    }
};

export const issueCard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const { accountId, cardType } = createCardSchema.parse(request.body);

        // Verify account ownership
        const account = await prisma.account.findFirst({
            where: { id: accountId, userId: user.userId },
        });

        if (!account) {
            return reply.status(404).send({ error: 'Not Found', message: 'Account not found' });
        }

        // Generate Mock Card Data
        const cardNumber = '4' + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 3); // 3 years expiry
        const cvv = Math.floor(Math.random() * 900 + 100).toString();

        const card = await prisma.card.create({
            data: {
                accountId,
                cardNumber,
                cardType,
                network: 'VISA',
                expiryDate,
                cvv,
                status: 'ACTIVE',
                dailyLimit: 2000,
                monthlyLimit: 20000,
            },
        });

        reply.status(201).send({ message: 'Card issued successfully', card });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ error: 'Validation Error', message: error.errors[0]?.message });
        }
        request.log.error('Issue card error:', error);
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to issue card' });
    }
};

export const freezeCard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const { cardId } = request.params as { cardId: string };

        const card = await prisma.card.findFirst({
            where: { id: cardId, account: { userId: user.userId } },
        });

        if (!card) {
            return reply.status(404).send({ error: 'Not Found', message: 'Card not found' });
        }

        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: { status: 'FROZEN' },
        });

        reply.send({ message: 'Card frozen', card: updatedCard });
    } catch (error) {
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to freeze card' });
    }
};

export const unfreezeCard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const { cardId } = request.params as { cardId: string };

        const card = await prisma.card.findFirst({
            where: { id: cardId, account: { userId: user.userId } },
        });

        if (!card) {
            return reply.status(404).send({ error: 'Not Found', message: 'Card not found' });
        }

        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: { status: 'ACTIVE' },
        });

        reply.send({ message: 'Card activated', card: updatedCard });
    } catch (error) {
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to unfreeze card' });
    }
};

export const updateCardLimits = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as any;
        const { cardId } = request.params as { cardId: string };
        const limits = updateLimitsSchema.parse(request.body);

        const card = await prisma.card.findFirst({
            where: { id: cardId, account: { userId: user.userId } },
        });

        if (!card) {
            return reply.status(404).send({ error: 'Not Found', message: 'Card not found' });
        }

        const { dailyLimit, monthlyLimit } = limits;

        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: {
                ...(dailyLimit !== undefined && { dailyLimit }),
                ...(monthlyLimit !== undefined && { monthlyLimit }),
            },
        });

        reply.send({ message: 'Card limits updated', card: updatedCard });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ error: 'Validation Error', message: error.errors[0]?.message });
        }
        reply.status(500).send({ error: 'Internal Server Error', message: 'Failed to update card limits' });
    }
};
