import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import portalStatusApiRoutes from "./portal-status";

export default async function routes(fastify: FastifyInstance) {
  // Health check endpoint (public)
  fastify.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "AURUM VAULT Admin Interface",
      version: "1.0.0",
    });
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(adminRoutes, { prefix: "/admin" });
  await fastify.register(portalStatusApiRoutes);
}
