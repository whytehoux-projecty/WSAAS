import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function notificationRoutes(fastify: FastifyInstance) {
    // Get Recent Notifications
    fastify.get(
        '/',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Get recent system notifications for the user',
                tags: ['Notifications'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        type: { type: 'string' },
                                        title: { type: 'string' },
                                        message: { type: 'string' },
                                        date: { type: 'string', format: 'date-time' },
                                        read: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as any;

            // Since we don't have a dedicated NotificationService import working yet due to path aliases or direct usage, 
            // let's implement the query directly here to ensure it works.

            // User-facing audit actions
            const relevantActions = [
                'WIRE_TRANSFER_APPROVED',
                'WIRE_TRANSFER_REJECTED',
                'KYC_STATUS_CHANGE',
                'USER_STATUS_CHANGE',
                'ACCOUNT_LOCKED'
            ];

            const logs = await prisma.auditLog.findMany({
                where: {
                    userId: user.id,
                    action: { in: relevantActions }
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            const notifications = logs.map(log => {
                let title = 'System Notification';
                let type = 'INFO';

                if (log.action.includes('APPROVED')) {
                    title = 'Approved';
                    type = 'SUCCESS';
                } else if (log.action.includes('REJECTED')) {
                    title = 'Rejected';
                    type = 'ERROR';
                } else if (log.action.includes('KYC')) {
                    title = 'KYC Update';
                    type = 'INFO';
                } else if (log.action.includes('LOCKED')) {
                    title = 'Account Alert';
                    type = 'WARNING';
                }

                return {
                    id: log.id,
                    type,
                    title,
                    message: log.details || 'No details',
                    date: log.createdAt,
                    read: false
                };
            });

            reply.send({ data: notifications });
        }
    );
}
