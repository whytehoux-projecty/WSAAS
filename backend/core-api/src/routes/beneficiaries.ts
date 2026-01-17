import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation Schemas
const createBeneficiarySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    swiftCode: z.string().optional(),
    nickname: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    isInternal: z.boolean().default(false),
});

// GET /api/beneficiaries
export const getBeneficiaries = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request as any).user.userId;

        const beneficiaries = await prisma.beneficiary.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        reply.send({
            success: true,
            data: beneficiaries,
        });
    } catch (error) {
        request.log.error('Get beneficiaries error:', error);
        reply.status(500).send({
            success: false,
            message: 'Failed to retrieve beneficiaries',
        });
    }
};

// POST /api/beneficiaries
export const createBeneficiary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request as any).user.userId;
        const data = createBeneficiarySchema.parse(request.body);

        const beneficiary = await prisma.beneficiary.create({
            data: {
                userId: userId,
                name: data.name,
                accountNumber: data.accountNumber,
                bankName: data.bankName,
                swiftCode: data.swiftCode ?? null,
                nickname: data.nickname ?? null,
                email: data.email ?? null,
                isInternal: false,
            },
        });

        reply.code(201).send({
            success: true,
            data: beneficiary,
            message: 'Beneficiary added successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                error: 'Validation Error',
                message: error.errors[0]?.message || 'Invalid input',
                details: error.errors,
            });
        }

        request.log.error('Create beneficiary error:', error);
        reply.status(500).send({
            success: false,
            message: 'Failed to add beneficiary',
        });
    }
};

// DELETE /api/beneficiaries/:id
export const deleteBeneficiary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request as any).user.userId;
        const { id } = request.params as { id: string };

        // Verify ownership
        const beneficiary = await prisma.beneficiary.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!beneficiary) {
            return reply.status(404).send({
                success: false,
                message: 'Beneficiary not found',
            });
        }

        await prisma.beneficiary.delete({
            where: { id },
        });

        reply.send({
            success: true,
            message: 'Beneficiary deleted successfully',
        });
    } catch (error) {
        request.log.error('Delete beneficiary error:', error);
        reply.status(500).send({
            success: false,
            message: 'Failed to delete beneficiary',
        });
    }
};
