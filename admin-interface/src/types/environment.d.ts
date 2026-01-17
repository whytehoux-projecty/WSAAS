declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "test";
      PORT?: string;
      JWT_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      BCRYPT_ROUNDS?: string;
      DATABASE_URL?: string;
      REDIS_URL?: string;
      CORS_ORIGIN?: string;
      RATE_LIMIT_MAX?: string;
      RATE_LIMIT_WINDOW?: string;
      MAX_FILE_SIZE?: string;
      UPLOAD_DIR?: string;
      ADMIN_SESSION_TIMEOUT?: string;
      COOKIE_SECRET?: string;
      LOG_LEVEL?: string;
    }
  }
}

export {};
