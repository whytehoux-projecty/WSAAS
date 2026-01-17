import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Portal Status Response Type
interface PortalHealthResponse {
    status: 'online' | 'offline' | 'maintenance' | 'scheduled_downtime';
    timestamp: string;
    message?: string;
    nextScheduledMaintenance?: string;
}

// Portal Status Update Schema
const updatePortalStatusSchema = z.object({
    status: z.enum(['online', 'offline', 'maintenance', 'scheduled_downtime']),
    message: z.string().optional(),
    nextScheduledMaintenance: z.string().datetime().optional(),
    scheduledMaintenanceMessage: z.string().optional(),
    reason: z.string().optional(),
});

type UpdatePortalStatusBody = z.infer<typeof updatePortalStatusSchema>;

export default async function portalRoutes(fastify: FastifyInstance) {
    const db = (fastify as any).db;
    const prisma = db.prisma;

    /**
     * PUBLIC ENDPOINT - Get Portal Health Status
     * This endpoint is publicly accessible and does not require authentication
     * Used by the login page to check if the e-banking portal is available
     */
    fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Get the current portal status from database
            // We expect only one record, so we'll take the first one
            let portalStatus = await prisma.portalStatus.findFirst({
                orderBy: { updatedAt: 'desc' },
            });

            // If no status exists, create a default one
            if (!portalStatus) {
                portalStatus = await prisma.portalStatus.create({
                    data: {
                        status: 'online',
                        message: 'E-Banking Portal is operational',
                    },
                });
            }

            // Build the response
            const response: PortalHealthResponse = {
                status: portalStatus.status as PortalHealthResponse['status'],
                timestamp: new Date().toISOString(),
            };

            // Add optional fields if they exist
            if (portalStatus.message) {
                response.message = portalStatus.message;
            }

            if (portalStatus.nextScheduledMaintenance) {
                response.nextScheduledMaintenance = portalStatus.nextScheduledMaintenance.toISOString();
            }

            // Return 200 for online, 503 for offline/maintenance
            const statusCode = portalStatus.status === 'online' ? 200 : 503;
            reply.status(statusCode);

            return {
                success: true,
                data: response,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: request.id,
                },
            };
        } catch (error) {
            fastify.log.error('Portal health check failed:', error);
            reply.status(500);
            return {
                success: false,
                error: {
                    code: 'PORTAL_HEALTH_CHECK_FAILED',
                    message: 'Unable to determine portal status',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: request.id,
                },
            };
        }
    });

    /**
     * ADMIN ENDPOINT - Update Portal Status
     * Requires admin authentication
     * Allows admins to change the portal status
     */
    fastify.post<{ Body: UpdatePortalStatusBody }>(
        '/status',
        {
            onRequest: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { type: 'string', enum: ['online', 'offline', 'maintenance', 'scheduled_downtime'] },
                        message: { type: 'string' },
                        nextScheduledMaintenance: { type: 'string', format: 'date-time' },
                        scheduledMaintenanceMessage: { type: 'string' },
                        reason: { type: 'string' },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: UpdatePortalStatusBody }>, reply: FastifyReply) => {
            try {
                // Validate request body
                const validatedData = updatePortalStatusSchema.parse(request.body);
                const adminUser = (request as any).user;

                // Verify user is an admin
                if (!adminUser || !adminUser.userId) {
                    reply.status(403);
                    return {
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED',
                            message: 'Admin access required',
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            requestId: request.id,
                        },
                    };
                }

                // Get current status for audit log
                const currentStatus = await prisma.portalStatus.findFirst({
                    orderBy: { updatedAt: 'desc' },
                });

                // Update or create portal status
                let updatedStatus;
                if (currentStatus) {
                    updatedStatus = await prisma.portalStatus.update({
                        where: { id: currentStatus.id },
                        data: {
                            status: validatedData.status,
                            message: validatedData.message,
                            nextScheduledMaintenance: validatedData.nextScheduledMaintenance
                                ? new Date(validatedData.nextScheduledMaintenance)
                                : null,
                            scheduledMaintenanceMessage: validatedData.scheduledMaintenanceMessage,
                            updatedBy: adminUser.userId,
                        },
                    });

                    // Create audit log entry
                    await prisma.portalStatusAudit.create({
                        data: {
                            portalStatusId: updatedStatus.id,
                            previousStatus: currentStatus.status,
                            newStatus: validatedData.status,
                            message: validatedData.message,
                            reason: validatedData.reason || 'Status update by admin',
                            changedBy: adminUser.userId,
                            ipAddress: request.ip,
                            userAgent: request.headers['user-agent'] || 'Unknown',
                        },
                    });
                } else {
                    updatedStatus = await prisma.portalStatus.create({
                        data: {
                            status: validatedData.status,
                            message: validatedData.message,
                            nextScheduledMaintenance: validatedData.nextScheduledMaintenance
                                ? new Date(validatedData.nextScheduledMaintenance)
                                : null,
                            scheduledMaintenanceMessage: validatedData.scheduledMaintenanceMessage,
                            updatedBy: adminUser.userId,
                        },
                    });
                }

                fastify.log.info('Portal status updated', {
                    previousStatus: currentStatus?.status,
                    newStatus: validatedData.status,
                    updatedBy: adminUser.userId,
                });

                return {
                    success: true,
                    data: {
                        id: updatedStatus.id,
                        status: updatedStatus.status,
                        message: updatedStatus.message,
                        nextScheduledMaintenance: updatedStatus.nextScheduledMaintenance?.toISOString(),
                        scheduledMaintenanceMessage: updatedStatus.scheduledMaintenanceMessage,
                        updatedAt: updatedStatus.updatedAt.toISOString(),
                    },
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: request.id,
                    },
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    reply.status(400);
                    return {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid request data',
                            details: error.errors,
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            requestId: request.id,
                        },
                    };
                }

                fastify.log.error('Portal status update failed:', error);
                reply.status(500);
                return {
                    success: false,
                    error: {
                        code: 'PORTAL_STATUS_UPDATE_FAILED',
                        message: 'Unable to update portal status',
                    },
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: request.id,
                    },
                };
            }
        }
    );

    /**
     * ADMIN ENDPOINT - Get Portal Status History
     * Requires admin authentication
     * Returns audit log of portal status changes
     */
    fastify.get(
        '/status/history',
        {
            onRequest: [fastify.authenticate],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const adminUser = (request as any).user;

                // Verify user is an admin
                if (!adminUser || !adminUser.userId) {
                    reply.status(403);
                    return {
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED',
                            message: 'Admin access required',
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            requestId: request.id,
                        },
                    };
                }

                // Get status history from audit log
                const history = await prisma.portalStatusAudit.findMany({
                    orderBy: { changedAt: 'desc' },
                    take: 50,
                    include: {
                        adminUser: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });

                return {
                    success: true,
                    data: history.map((entry: any) => ({
                        id: entry.id,
                        previousStatus: entry.previousStatus,
                        newStatus: entry.newStatus,
                        message: entry.message,
                        reason: entry.reason,
                        changedAt: entry.changedAt.toISOString(),
                        changedBy: {
                            id: entry.adminUser.id,
                            name: `${entry.adminUser.firstName} ${entry.adminUser.lastName}`,
                            email: entry.adminUser.email,
                        },
                        ipAddress: entry.ipAddress,
                    })),
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: request.id,
                        totalRecords: history.length,
                    },
                };
            } catch (error) {
                fastify.log.error('Failed to fetch portal status history:', error);
                reply.status(500);
                return {
                    success: false,
                    error: {
                        code: 'HISTORY_FETCH_FAILED',
                        message: 'Unable to fetch portal status history',
                    },
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: request.id,
                    },
                };
            }
        }
    );

    /**
     * ADMIN ENDPOINT - Get Current Portal Status
     * Requires admin authentication
     * Returns current portal status with full details
     */
    fastify.get(
        '/status',
        {
            onRequest: [fastify.authenticate],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const adminUser = (request as any).user;

                // Verify user is an admin
                if (!adminUser || !adminUser.userId) {
                    reply.status(403);
                    return {
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED',
                            message: 'Admin access required',
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            requestId: request.id,
                        },
                    };
                }

                // Get current status
                const currentStatus = await prisma.portalStatus.findFirst({
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        adminUser: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });

                if (!currentStatus) {
                    // Create default status if none exists
                    const defaultStatus = await prisma.portalStatus.create({
                        data: {
                            status: 'online',
                            message: 'E-Banking Portal is operational',
                        },
                    });

                    return {
                        success: true,
                        data: {
                            id: defaultStatus.id,
                            status: defaultStatus.status,
                            message: defaultStatus.message,
                            updatedAt: defaultStatus.updatedAt.toISOString(),
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            requestId: request.id,
                        },
                    };
                }

                return {
                    success: true,
                    data: {
                        id: currentStatus.id,
                        status: currentStatus.status,
                        message: currentStatus.message,
                        nextScheduledMaintenance: currentStatus.nextScheduledMaintenance?.toISOString(),
                        scheduledMaintenanceMessage: currentStatus.scheduledMaintenanceMessage,
                        updatedAt: currentStatus.updatedAt.toISOString(),
                        updatedBy: currentStatus.adminUser
                            ? {
                                id: currentStatus.adminUser.id,
                                name: `${currentStatus.adminUser.firstName} ${currentStatus.adminUser.lastName}`,
                                email: currentStatus.adminUser.email,
                            }
                            : null,
                    },
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: request.id,
                    },
                };
            } catch (error) {
                fastify.log.error('Failed to fetch current portal status:', error);
                reply.status(500);
                return {
                    success: false,
                    error: {
                        code: 'STATUS_FETCH_FAILED',
                        message: 'Unable to fetch current portal status',
                    },
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: request.id,
                    },
                };
            }
        }
    );
}
