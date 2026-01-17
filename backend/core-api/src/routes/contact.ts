import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
});

export const submitContactForm = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = contactSchema.parse(request.body);

        const submission = await prisma.contactSubmission.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                subject: data.subject,
                message: data.message,
                status: 'NEW',
            },
        });

        reply.code(201).send({
            message: 'Contact form submitted successfully',
            id: submission.id,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                error: 'Validation Error',
                message: error.errors[0]?.message || 'Invalid input',
                details: error.errors,
            });
        }

        request.log.error('Contact form submission error:', error);
        reply.status(500).send({
            error: 'Internal Server Error',
            message: 'Failed to submit contact form',
        });
    }
};
