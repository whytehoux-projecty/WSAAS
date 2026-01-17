import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const accountApplicationSchema = z.object({
    applicationType: z.enum(['PERSONAL', 'BUSINESS', 'WEALTH']),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.string().or(z.date()).transform((val) => new Date(val)),
    ssn: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'Zip code is required'),
    employmentStatus: z.string().min(1, 'Employment status is required'),
    annualIncome: z.number().or(z.string().transform(Number)),
    sourceOfFunds: z.string().min(1, 'Source of funds is required'),
});

export const submitApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = accountApplicationSchema.parse(request.body);

        const application = await prisma.accountApplication.create({
            data: {
                applicationType: data.applicationType,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                dateOfBirth: data.dateOfBirth,
                ssn: data.ssn ?? null,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                employmentStatus: data.employmentStatus,
                annualIncome: data.annualIncome,
                sourceOfFunds: data.sourceOfFunds,
                status: 'PENDING',
            },
        });

        reply.code(201).send({
            message: 'Account application submitted successfully',
            id: application.id,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                error: 'Validation Error',
                message: error.errors[0]?.message || 'Invalid input',
                details: error.errors,
            });
        }

        request.log.error('Account application submission error:', error);
        reply.status(500).send({
            error: 'Internal Server Error',
            message: 'Failed to submit account application',
        });
    }
};
