import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  dateOfBirth: z.string().transform(str => new Date(str)),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  accountNumber: z.string().optional(),
  password: z.string().min(1),
}).refine((data) => data.email || data.accountNumber, {
  message: 'Either email or account number is required',
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register endpoint
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'dateOfBirth'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string', minLength: 2 },
            lastName: { type: 'string', minLength: 2 },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const validatedData = registerSchema.parse(request.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (existingUser) {
          return reply.status(400).send({
            error: 'User already exists',
            message: 'A user with this email address already exists',
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Extract address to handle separately
        const { address, phone, ...userData } = validatedData;

        // Create user with properly structured address data
        const user = await prisma.user.create({
          data: {
            ...userData,
            phone: phone || null,
            password: hashedPassword,
            status: 'PENDING_VERIFICATION',
            kycStatus: 'PENDING',
            // Create address if provided with proper Prisma nested input
            ...(address
              ? {
                address: {
                  create: address,
                },
              }
              : {}),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            kycStatus: true,
            createdAt: true,
          },
        });

        reply.status(201).send({
          message: 'User registered successfully',
          user,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: error.errors.map((e: any) => e.message).join(', '),
          });
        }

        fastify.log.error('Registration error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to register user',
        });
      }
    }
  );

  // Login endpoint
  fastify.post(
    '/login',
    {
      schema: {
        description: 'Authenticate user and return JWT tokens',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  status: { type: 'string' },
                },
              },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, accountNumber, password } = loginSchema.parse(request.body);

        // Find user by email or account number
        let user;

        if (email) {
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              status: true,
              kycStatus: true,
              lastLoginAt: true,
            },
          });
        } else if (accountNumber) {
          // Find account first to getting user
          const account = await prisma.account.findUnique({
            where: { accountNumber },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  password: true,
                  firstName: true,
                  lastName: true,
                  status: true,
                  kycStatus: true,
                  lastLoginAt: true,
                },
              },
            },
          });

          if (account) {
            user = account.user;
          }
        }

        if (!user) {
          return reply.status(401).send({
            error: 'Authentication Failed',
            message: 'Invalid email or password',
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return reply.status(401).send({
            error: 'Authentication Failed',
            message: 'Invalid email or password',
          });
        }

        // Check if user is active
        if (user.status === 'SUSPENDED' || user.status === 'CLOSED') {
          return reply.status(401).send({
            error: 'Account Suspended',
            message: 'Your account has been suspended. Please contact support.',
          });
        }

        // Generate tokens
        const accessToken = fastify.jwt.sign(
          {
            userId: user.id,
            email: user.email,
            status: user.status,
          },
          { expiresIn: '15m' }
        );

        const refreshToken = fastify.jwt.sign(
          {
            userId: user.id,
            type: 'refresh',
          },
          { expiresIn: '7d' }
        );

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Create user session
        await prisma.userSession.create({
          data: {
            userId: user.id,
            sessionId: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || 'Unknown',
          },
        });

        // Set HTTP-only cookie for refresh token
        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        reply.send({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
            kycStatus: user.kycStatus,
          },
          accessToken,
          refreshToken,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: error.errors.map((e: any) => e.message).join(', '),
          });
        }

        fastify.log.error('Login error:', error);
        reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to authenticate user',
        });
      }
    }
  );

  // Refresh token endpoint
  fastify.post(
    '/refresh',
    {
      schema: {
        description: 'Refresh access token using refresh token',
        tags: ['Authentication'],
        body: {
          type: 'object',
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const refreshToken = (request.body as any)?.refreshToken || request.cookies['refreshToken'];

        if (!refreshToken) {
          return reply.status(401).send({
            error: 'No Refresh Token',
            message: 'Refresh token is required',
          });
        }

        // Verify refresh token
        const decoded = fastify.jwt.verify(refreshToken) as any;

        if (decoded.type !== 'refresh') {
          return reply.status(401).send({
            error: 'Invalid Token',
            message: 'Invalid refresh token',
          });
        }

        // Check if session exists and is valid
        const session = await prisma.userSession.findFirst({
          where: {
            sessionId: refreshToken,
            expiresAt: { gt: new Date() },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
              },
            },
          },
        });

        if (!session) {
          return reply.status(401).send({
            error: 'Invalid Session',
            message: 'Session expired or invalid',
          });
        }

        // Generate new tokens
        const newAccessToken = fastify.jwt.sign(
          {
            userId: session.user.id,
            email: session.user.email,
            status: session.user.status,
          },
          { expiresIn: '15m' }
        );

        const newRefreshToken = fastify.jwt.sign(
          {
            userId: session.user.id,
            type: 'refresh',
          },
          { expiresIn: '7d' }
        );

        // Update session with new refresh token
        await prisma.userSession.update({
          where: { id: session.id },
          data: {
            sessionId: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        // Set new refresh token cookie
        reply.setCookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        reply.send({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        fastify.log.error('Token refresh error:', error);
        reply.status(401).send({
          error: 'Token Refresh Failed',
          message: 'Failed to refresh token',
        });
      }
    }
  );

  // Logout endpoint
  fastify.post(
    '/logout',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Logout user and invalidate session',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const refreshToken = request.cookies['refreshToken'];

        if (refreshToken) {
          // Invalidate session
          await prisma.userSession.deleteMany({
            where: {
              userId: user.userId,
              sessionId: refreshToken,
            },
          });
        }

        // Clear refresh token cookie
        reply.clearCookie('refreshToken');

        reply.send({
          message: 'Logout successful',
        });
      } catch (error) {
        fastify.log.error('Logout error:', error);
        reply.status(500).send({
          error: 'Logout Failed',
          message: 'Failed to logout user',
        });
      }
    }
  );

  // Get current user profile
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                  status: { type: 'string' },
                  kycStatus: { type: 'string' },
                  createdAt: { type: 'string' },
                  lastLoginAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;

        const userProfile = await prisma.user.findUnique({
          where: { id: user.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            kycStatus: true,
            createdAt: true,
            lastLoginAt: true,
          },
        });

        if (!userProfile) {
          return reply.status(404).send({
            error: 'User Not Found',
            message: 'User profile not found',
          });
        }

        reply.send({ user: userProfile });
      } catch (error) {
        fastify.log.error('Get profile error:', error);
        reply.status(500).send({
          error: 'Profile Fetch Failed',
          message: 'Failed to fetch user profile',
        });
      }
    }
  );
}

// Export individual route handlers for use in index.ts
export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validatedData = registerSchema.parse(request.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return reply.status(400).send({
        error: 'User already exists',
        message: 'A user with this email address already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        dateOfBirth: validatedData.dateOfBirth,
        status: 'PENDING_VERIFICATION',
        kycStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    reply.status(201).send({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.errors.map((e: any) => e.message).join(', '),
      });
    }

    request.log.error('Registration error:', error);
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to register user',
    });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, accountNumber, password } = loginSchema.parse(request.body);

    // Find user by email or account number
    let user;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          status: true,
          kycStatus: true,
          lastLoginAt: true,
        },
      });
    } else if (accountNumber) {
      // Find account first to getting user
      const account = await prisma.account.findUnique({
        where: { accountNumber },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              status: true,
              kycStatus: true,
              lastLoginAt: true,
            },
          },
        },
      });

      if (account) {
        user = account.user;
      }
    }

    if (!user) {
      return reply.status(401).send({
        error: 'Authentication Failed',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.status(401).send({
        error: 'Authentication Failed',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (user.status === 'SUSPENDED' || user.status === 'CLOSED') {
      return reply.status(401).send({
        error: 'Account Suspended',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Generate tokens
    const accessToken = (request as any).server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        status: user.status,
      },
      { expiresIn: '15m' }
    );

    const refreshToken = (request as any).server.jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      { expiresIn: '7d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create user session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionId: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'Unknown',
      },
    });

    // Set HTTP-only cookie for refresh token
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    reply.send({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        kycStatus: user.kycStatus,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.errors.map((e: any) => e.message).join(', '),
      });
    }

    request.log.error('Login error:', error);
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to authenticate user',
    });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const refreshToken = (request as any).cookies?.refreshToken;

    if (refreshToken) {
      // Invalidate session
      await prisma.userSession.deleteMany({
        where: {
          userId: user.userId,
          sessionId: refreshToken,
        },
      });
    }

    // Clear refresh token cookie
    reply.clearCookie('refreshToken');

    reply.send({
      message: 'Logout successful',
    });
  } catch (error) {
    request.log.error('Logout error:', error);
    reply.status(500).send({
      error: 'Logout Failed',
      message: 'Failed to logout user',
    });
  }
};

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: 'TOKEN_REQUIRED',
        message: 'Access token required',
      });
    }

    // Verify JWT token
    (request as any).server.jwt.verify(token);

    // Check if session is still active
    const session = await prisma.userSession.findFirst({
      where: {
        sessionId: token,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        error: 'TOKEN_INVALID',
        message: 'Token expired or session invalid',
      });
    }

    reply.send({
      success: true,
      user: {
        userId: session.user.id,
        email: session.user.email,
        status: session.user.status,
        kycStatus: session.user.kycStatus,
      },
    });
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: 'TOKEN_INVALID',
      message: 'Invalid token',
    });
  }
};

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;

    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        kycStatus: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!userProfile) {
      return reply.status(404).send({
        error: 'User Not Found',
        message: 'User profile not found',
      });
    }

    reply.send({ user: userProfile });
  } catch (error) {
    request.log.error('Get profile error:', error);
    reply.status(500).send({
      error: 'Profile Fetch Failed',
      message: 'Failed to fetch user profile',
    });
  }
};

export const updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const updateData = request.body as any;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        kycStatus: true,
        updatedAt: true,
      },
    });

    reply.send({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    request.log.error('Update profile error:', error);
    reply.status(500).send({
      error: 'Profile Update Failed',
      message: 'Failed to update user profile',
    });
  }
};

export const changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const { currentPassword, newPassword } = request.body as any;

    // Get current user with password
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { password: true },
    });

    if (!currentUser) {
      return reply.status(404).send({
        error: 'User Not Found',
        message: 'User not found',
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isValidPassword) {
      return reply.status(400).send({
        error: 'Invalid Password',
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.userId },
      data: { password: hashedNewPassword },
    });

    reply.send({
      message: 'Password changed successfully',
    });
  } catch (error) {
    request.log.error('Change password error:', error);
    reply.status(500).send({
      error: 'Password Change Failed',
      message: 'Failed to change password',
    });
  }
};

export const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const refreshToken = (request.body as any)?.refreshToken || request.cookies['refreshToken'];

    if (!refreshToken) {
      return reply.status(401).send({
        error: 'No Refresh Token',
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = (request as any).server.jwt.verify(refreshToken) as any;

    if (decoded.type !== 'refresh') {
      return reply.status(401).send({
        error: 'Invalid Token',
        message: 'Invalid refresh token',
      });
    }

    // Check if session exists and is valid
    const session = await prisma.userSession.findFirst({
      where: {
        sessionId: refreshToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!session) {
      return reply.status(401).send({
        error: 'Invalid Session',
        message: 'Session expired or invalid',
      });
    }

    // Generate new tokens
    const newAccessToken = (request as any).server.jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        status: session.user.status,
      },
      { expiresIn: '15m' }
    );

    const newRefreshToken = (request as any).server.jwt.sign(
      {
        userId: session.user.id,
        type: 'refresh',
      },
      { expiresIn: '7d' }
    );

    // Update session with new refresh token
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        sessionId: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set new refresh token cookie
    reply.setCookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    reply.send({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    request.log.error('Token refresh error:', error);
    reply.status(401).send({
      error: 'Token Refresh Failed',
      message: 'Failed to refresh token',
    });
  }
};