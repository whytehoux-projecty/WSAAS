import { FastifyInstance } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';

interface ConnectedClient {
    socket: WebSocket;
    userId: string;
    role: string;
    lastPing: Date;
}

interface BroadcastMessage {
    type: 'STATS_UPDATE' | 'USER_UPDATE' | 'TRANSACTION_UPDATE' | 'NOTIFICATION' | 'ALERT' | 'KYC_UPDATE' | 'WIRE_TRANSFER_UPDATE';
    data: any;
    timestamp: string;
}

class WebSocketServiceClass {
    private clients: Map<string, ConnectedClient> = new Map();
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private statsInterval: NodeJS.Timeout | null = null;

    /**
     * Initialize WebSocket service
     */
    async initialize(fastify: FastifyInstance): Promise<void> {
        // Start heartbeat to clean up dead connections
        this.heartbeatInterval = setInterval(() => {
            this.cleanupDeadConnections();
        }, 30000); // Every 30 seconds

        // Start stats broadcast interval
        this.statsInterval = setInterval(() => {
            this.broadcastStats();
        }, 10000); // Every 10 seconds

        fastify.log.info('WebSocket service initialized');
    }

    /**
     * Handle new WebSocket connection
     */
    handleConnection(socket: WebSocket, token: string): void {
        try {
            // Verify JWT token
            const decoded = jwt.verify(token, JWT_SECRET) as any;

            const clientId = `${decoded.id}-${Date.now()}`;

            this.clients.set(clientId, {
                socket,
                userId: decoded.id,
                role: decoded.role || 'ADMIN',
                lastPing: new Date()
            });

            console.log(`WebSocket client connected: ${clientId}`);

            // Send initial connection confirmation
            this.sendToClient(clientId, {
                type: 'NOTIFICATION',
                data: { message: 'Connected to real-time updates' },
                timestamp: new Date().toISOString()
            });

            // Handle incoming messages
            socket.on('message', (message: Buffer) => {
                this.handleMessage(clientId, message.toString());
            });

            // Handle disconnection
            socket.on('close', () => {
                this.clients.delete(clientId);
                console.log(`WebSocket client disconnected: ${clientId}`);
            });

            // Handle errors
            socket.on('error', (error: Error) => {
                console.error(`WebSocket error for client ${clientId}:`, error);
                this.clients.delete(clientId);
            });

        } catch (error) {
            console.error('WebSocket authentication failed:', error);
            socket.close(4001, 'Authentication failed');
        }
    }

    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(clientId: string, message: string): void {
        try {
            const parsed = JSON.parse(message);
            const client = this.clients.get(clientId);

            if (!client) return;

            switch (parsed.type) {
                case 'PING':
                    client.lastPing = new Date();
                    this.sendToClient(clientId, {
                        type: 'NOTIFICATION',
                        data: { pong: true },
                        timestamp: new Date().toISOString()
                    });
                    break;

                case 'SUBSCRIBE':
                    // Handle subscription to specific channels
                    console.log(`Client ${clientId} subscribed to:`, parsed.channels);
                    break;

                default:
                    console.log(`Unknown message type from ${clientId}:`, parsed.type);
            }
        } catch (error) {
            console.error(`Failed to parse message from ${clientId}:`, error);
        }
    }

    /**
     * Send message to specific client
     */
    private sendToClient(clientId: string, message: BroadcastMessage): void {
        const client = this.clients.get(clientId);
        if (client && client.socket.readyState === 1) { // OPEN
            client.socket.send(JSON.stringify(message));
        }
    }

    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: BroadcastMessage): void {
        const messageStr = JSON.stringify(message);

        this.clients.forEach((client, _clientId) => {
            if (client.socket.readyState === 1) { // OPEN
                client.socket.send(messageStr);
            }
        });
    }

    /**
     * Broadcast to clients with specific role
     */
    broadcastToRole(role: string, message: BroadcastMessage): void {
        const messageStr = JSON.stringify(message);

        this.clients.forEach((client) => {
            if (client.role === role && client.socket.readyState === 1) {
                client.socket.send(messageStr);
            }
        });
    }

    /**
     * Broadcast dashboard stats update
     */
    private async broadcastStats(): Promise<void> {
        // This will be called periodically to push fresh stats
        this.broadcast({
            type: 'STATS_UPDATE',
            data: { refresh: true },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify about user-related changes
     */
    notifyUserUpdate(userId: string, action: string, data: any): void {
        this.broadcast({
            type: 'USER_UPDATE',
            data: { userId, action, ...data },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify about transaction changes
     */
    notifyTransactionUpdate(transactionId: string, status: string, data: any): void {
        this.broadcast({
            type: 'TRANSACTION_UPDATE',
            data: { transactionId, status, ...data },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify about KYC status changes
     */
    notifyKYCUpdate(userId: string, status: string, data: any): void {
        this.broadcast({
            type: 'KYC_UPDATE',
            data: { userId, status, ...data },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify about wire transfer changes
     */
    notifyWireTransferUpdate(transferId: string, status: string, data: any): void {
        this.broadcast({
            type: 'WIRE_TRANSFER_UPDATE',
            data: { transferId, status, ...data },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send system alert to all admins
     */
    sendAlert(severity: 'info' | 'warning' | 'error' | 'critical', message: string, details?: any): void {
        this.broadcast({
            type: 'ALERT',
            data: { severity, message, details },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Clean up dead WebSocket connections
     */
    private cleanupDeadConnections(): void {
        const now = new Date();
        const timeout = 60000; // 60 seconds

        this.clients.forEach((client, clientId) => {
            const timeSinceLastPing = now.getTime() - client.lastPing.getTime();

            if (timeSinceLastPing > timeout || client.socket.readyState !== 1) {
                console.log(`Cleaning up dead connection: ${clientId}`);
                client.socket.close();
                this.clients.delete(clientId);
            }
        });
    }

    /**
     * Get count of connected clients
     */
    getConnectedCount(): number {
        return this.clients.size;
    }

    /**
     * Shutdown WebSocket service
     */
    shutdown(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }

        // Close all connections
        this.clients.forEach((client) => {
            client.socket.close(1001, 'Server shutting down');
        });
        this.clients.clear();

        console.log('WebSocket service shut down');
    }
}

export const WebSocketService = new WebSocketServiceClass();
