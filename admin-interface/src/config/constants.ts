export const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production';
export const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '24h';
export const BCRYPT_ROUNDS = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
export const PORT = parseInt(process.env['PORT'] || '3002');
export const NODE_ENV = process.env['NODE_ENV'] || 'development';
export const DATABASE_URL = process.env['DATABASE_URL'] || 'postgresql://username:password@localhost:5432/aurumvault';
export const REDIS_URL = process.env['REDIS_URL'] || 'redis://localhost:6379';

// CORS settings
export const CORS_ORIGIN = process.env['CORS_ORIGIN'] || 'http://localhost:3000';

// Rate limiting
export const RATE_LIMIT_MAX = parseInt(process.env['RATE_LIMIT_MAX'] || '100');
export const RATE_LIMIT_WINDOW = parseInt(process.env['RATE_LIMIT_WINDOW'] || '900000'); // 15 minutes

// File upload settings
export const MAX_FILE_SIZE = parseInt(process.env['MAX_FILE_SIZE'] || '10485760'); // 10MB
export const UPLOAD_DIR = process.env['UPLOAD_DIR'] || './uploads';

// Admin settings
export const ADMIN_SESSION_TIMEOUT = parseInt(process.env['ADMIN_SESSION_TIMEOUT'] || '86400000'); // 24 hours