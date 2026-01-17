import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';

/**
 * Admin Portal Status API Routes
 * Proxies portal status management requests to the backend API
 */

export default async function portalStatusApiRoutes(fastify: FastifyInstance) {

    /**
     * Get Current Portal Status (Proxy to Backend API)
     * GET /api/portal/status
     */
    fastify.get('/api/portal/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const adminToken = request.cookies['admin_token'];

            if (!adminToken) {
                return reply.status(401).send({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }
                });
            }

            // Proxy request to backend API
            const apiUrl = process.env['API_URL'] || 'http://localhost:3001';
            const response = await axios.get(
                `${apiUrl}/api/portal/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            return reply.send(response.data);
        } catch (error: any) {
            fastify.log.error('Error fetching portal status:', error?.message);

            if (error.response) {
                return reply.status(error.response.status).send(error.response.data);
            }

            return reply.status(500).send({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch portal status'
                }
            });
        }
    });

    /**
     * Update Portal Status (Proxy to Backend API)
     * POST /api/portal/status
     */
    fastify.post('/api/portal/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const adminToken = request.cookies['admin_token'];

            if (!adminToken) {
                return reply.status(401).send({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }
                });
            }

            // Proxy request to backend API
            const apiUrl = process.env['API_URL'] || 'http://localhost:3001';
            const response = await axios.post(
                `${apiUrl}/api/portal/status`,
                request.body,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Log the status change
            const user = (request as any).user;
            fastify.log.info({
                admin: user?.email || 'Unknown',
                newStatus: (request.body as any).status,
                timestamp: new Date().toISOString()
            }, 'Portal status updated');

            return reply.send(response.data);
        } catch (error: any) {
            fastify.log.error('Error updating portal status:', error?.message);

            if (error.response) {
                return reply.status(error.response.status).send(error.response.data);
            }

            return reply.status(500).send({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update portal status'
                }
            });
        }
    });

    /**
     * Get Portal Status History (Proxy to Backend API)
     * GET /api/portal/status/history
     */
    fastify.get('/api/portal/status/history', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const adminToken = request.cookies['admin_token'];

            if (!adminToken) {
                return reply.status(401).send({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }
                });
            }

            // Proxy request to backend API
            const apiUrl = process.env['API_URL'] || 'http://localhost:3001';
            const response = await axios.get(
                `${apiUrl}/api/portal/status/history`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            return reply.send(response.data);
        } catch (error: any) {
            fastify.log.error('Error fetching portal status history:', error?.message);

            if (error.response) {
                return reply.status(error.response.status).send(error.response.data);
            }

            return reply.status(500).send({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch portal status history'
                }
            });
        }
    });

    /**
     * Get Portal Health (Public - Proxy to Backend API)
     * GET /api/portal/health
     */
    fastify.get('/api/portal/health', async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Proxy request to backend API - public endpoint
            const apiUrl = process.env['API_URL'] || 'http://localhost:3001';
            const response = await axios.get(`${apiUrl}/api/portal/health`);

            return reply.send(response.data);
        } catch (error: any) {
            fastify.log.error('Error fetching portal health:', error?.message);

            if (error.response) {
                return reply.status(error.response.status).send(error.response.data);
            }

            return reply.status(503).send({
                success: false,
                data: {
                    status: 'unknown',
                    timestamp: new Date().toISOString(),
                    message: 'Unable to reach backend API'
                }
            });
        }
    });
}
