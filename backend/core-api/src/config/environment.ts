import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvironmentConfig {
  // Server Configuration
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  LOG_LEVEL: string;

  // Database Configuration
  DATABASE_URL: string;
  REDIS_URL: string;

  // Authentication Configuration
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;

  // External Services
  ALLOWED_ORIGINS: string[];

  // Security Configuration
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_MS: number;

  // File Upload Configuration
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;

  // Optional External Services
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;

  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;

  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

  // Check for required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    // Server Configuration
    NODE_ENV: process.env['NODE_ENV'] || 'development',
    PORT: parseInt(process.env['PORT'] || '3001'),
    HOST: process.env['HOST'] || '0.0.0.0',
    LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',

    // Database Configuration
    DATABASE_URL: process.env['DATABASE_URL']!,
    REDIS_URL: process.env['REDIS_URL'] || 'redis://localhost:6379',

    // Authentication Configuration
    JWT_SECRET: process.env['JWT_SECRET']!,
    JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '24h',
    BCRYPT_ROUNDS: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),

    // External Services
    ALLOWED_ORIGINS: (process.env['ALLOWED_ORIGINS'] || 'http://localhost:3000')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),

    // Security Configuration
    RATE_LIMIT_MAX: parseInt(process.env['RATE_LIMIT_MAX'] || '100'),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'),

    // File Upload Configuration
    MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'), // 10MB
    UPLOAD_PATH: process.env['UPLOAD_PATH'] || './uploads',

    // Optional External Services (only include when defined)
    ...(process.env['SMTP_HOST'] ? { SMTP_HOST: process.env['SMTP_HOST'] } : {}),
    ...(process.env['SMTP_PORT'] ? { SMTP_PORT: parseInt(process.env['SMTP_PORT']) } : {}),
    ...(process.env['SMTP_USER'] ? { SMTP_USER: process.env['SMTP_USER'] } : {}),
    ...(process.env['SMTP_PASS'] ? { SMTP_PASS: process.env['SMTP_PASS'] } : {}),

    ...(process.env['AWS_ACCESS_KEY_ID']
      ? { AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] }
      : {}),
    ...(process.env['AWS_SECRET_ACCESS_KEY']
      ? { AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] }
      : {}),
    ...(process.env['AWS_REGION'] ? { AWS_REGION: process.env['AWS_REGION'] } : {}),
    ...(process.env['AWS_S3_BUCKET'] ? { AWS_S3_BUCKET: process.env['AWS_S3_BUCKET'] } : {}),

    ...(process.env['TWILIO_ACCOUNT_SID']
      ? { TWILIO_ACCOUNT_SID: process.env['TWILIO_ACCOUNT_SID'] }
      : {}),
    ...(process.env['TWILIO_AUTH_TOKEN']
      ? { TWILIO_AUTH_TOKEN: process.env['TWILIO_AUTH_TOKEN'] }
      : {}),
    ...(process.env['TWILIO_PHONE_NUMBER']
      ? { TWILIO_PHONE_NUMBER: process.env['TWILIO_PHONE_NUMBER'] }
      : {}),
  } as EnvironmentConfig;
};

export const config = getEnvironmentConfig();
export default config;
