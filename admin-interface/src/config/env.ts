import { z } from "zod";

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3002"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  COOKIE_SECRET: z
    .string()
    .min(32, "Cookie secret must be at least 32 characters"),
  REDIS_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
  RATE_LIMIT_WINDOW: z.string().default("15 minutes"),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Validate and export environment configuration
export const env = envSchema.parse(process.env);

// Helper to check if we're in a specific environment
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
