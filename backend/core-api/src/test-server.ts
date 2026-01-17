// Simple backend test server
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// Root endpoint
fastify.get('/', async () => {
    return { message: 'Hello from AURUM VAULT API!', timestamp: new Date().toISOString() };
});

// Health endpoint
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: 'localhost' });
        console.log('Test server running on http://localhost:3001');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
