import "dotenv/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import compress from "@fastify/compress";
import view from "@fastify/view";
import formbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import path from "path";
import ejs from "ejs";
import { ZodError } from "zod";
import rateLimit from "@fastify/rate-limit";
import {
  PORT,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW,
} from "./config/constants";
import { authenticateToken } from "./middleware/auth";
import routes from "./routes";
import webRoutes from "./routes/web";

export async function build() {
  // Create logger configuration
  let loggerConfig: any = false;

  if (process.env["NODE_ENV"] === "development") {
    try {
      // Try to use pino-pretty for development
      loggerConfig = {
        level: process.env["LOG_LEVEL"] || "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      };
    } catch (error) {
      // Fallback to basic logging if pino-pretty is not available
      loggerConfig = {
        level: process.env["LOG_LEVEL"] || "info",
      };
    }
  } else if (process.env["NODE_ENV"] === "test") {
    loggerConfig = { level: "error" };
  } else {
    loggerConfig = {
      level: process.env["LOG_LEVEL"] || "info",
    };
  }

  const fastify = Fastify({
    logger: loggerConfig,
  });

  // Security plugins
  // Security plugins
  await fastify.register(helmet, {
    global: true,
    hsts: false, // Disable HSTS to prevent auto-upgrade to HTTPS on localhost
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-eval'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
        upgradeInsecureRequests: null,
      },
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Cookie support
  await fastify.register(cookie, {
    secret:
      process.env["COOKIE_SECRET"] || "your-cookie-secret-change-in-production",
    parseOptions: {
      httpOnly: true,
      secure: false, // Force false for development
      sameSite: "lax", // Lax for easier dev navigation
    },
  });

  // Form body parser
  await fastify.register(formbody);

  // Static file serving
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/", // optional: default '/'
  });

  // View engine setup
  await fastify.register(view, {
    engine: {
      ejs: ejs,
    },
    root: path.join(__dirname, "views"),
    // layout option removed to satisfy @fastify/view types
  });

  // Compression
  await fastify.register(compress, {
    global: true,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: RATE_LIMIT_MAX,
    timeWindow: RATE_LIMIT_WINDOW,
    errorResponseBuilder: (_request, context) => {
      return {
        code: 429,
        error: "Too Many Requests",
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        expiresIn: Math.round(context.ttl / 1000),
      };
    },
  });

  // Authentication decorator
  fastify.decorate("authenticate", authenticateToken);

  // Global error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    if (error instanceof ZodError || error.name === 'ZodError') {
      return reply.status(400).send({
        error: "Validation Error",
        message: "Invalid input data",
        details: (error as any).errors || (error as any).issues,
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        error: "Validation Error",
        message: error.message,
        details: error.validation,
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.name || "Error",
        message: error.message,
      });
    }

    return reply.status(500).send({
      error: "Internal Server Error",
      message:
        process.env["NODE_ENV"] === "production"
          ? "Something went wrong"
          : error.message,
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // Register web routes (for HTML pages)
  await fastify.register(webRoutes);

  // Register API routes
  await fastify.register(routes, { prefix: "/api" });


  return fastify;
}

async function start() {
  try {
    const fastify = await build();

    // Graceful shutdown
    const signals = ["SIGINT", "SIGTERM"];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        fastify.log.info(`Received ${signal}, shutting down gracefully...`);
        try {
          await fastify.close();
          process.exit(0);
        } catch (error) {
          fastify.log.error(error, "Error during shutdown:");
          process.exit(1);
        }
      });
    });

    // Start server
    await fastify.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    fastify.log.info(
      `🚀 Aurum Vault Admin Interface server running on port ${PORT}`
    );
    fastify.log.info(
      `📊 Environment: ${process.env["NODE_ENV"] || "development"}`
    );
    fastify.log.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Only start the server if this file is run directly
if (require.main === module) {
  start();
}
