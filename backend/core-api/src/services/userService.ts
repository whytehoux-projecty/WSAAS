import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG, BUSINESS_RULES, ERROR_CODES } from '@shared/index';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Create a new user account
   */
  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error(ERROR_CODES.USER_ALREADY_EXISTS);
    }

    // Validate age requirement
    const age = this.calculateAge(userData.dateOfBirth);
    if (age < BUSINESS_RULES.MIN_AGE) {
      throw new Error(`User must be at least ${BUSINESS_RULES.MIN_AGE} years old`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, AUTH_CONFIG.BCRYPT_ROUNDS);

    // Create user with properly structured address data
    const { address, ...userDataWithoutAddress } = userData;
    
    const user = await prisma.user.create({
      data: {
        ...userDataWithoutAddress,
        password: hashedPassword,
        status: 'ACTIVE',
        kycStatus: 'PENDING',
        tier: 'BASIC',
        riskLevel: 'LOW',
        // Create address if provided with proper Prisma nested input
        ...(address ? {
          address: {
            create: address
          }
        } : {})
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        status: true,
        kycStatus: true,
        tier: true,
        createdAt: true
      }
    });

    return user;
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        status: true,
        kycStatus: true,
        tier: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      throw new Error(ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error(ERROR_CODES.ACCOUNT_LOCKED);
    }

    // Check if account is suspended
    if (user.status === 'SUSPENDED') {
      throw new Error(ERROR_CODES.ACCOUNT_SUSPENDED);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      await this.handleFailedLogin(user.id);
      throw new Error(ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Handle failed login attempts
   */
  static async handleFailedLogin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true }
    });

    const attempts = (user?.loginAttempts || 0) + 1;
    const updateData: any = { loginAttempts: attempts };

    // Lock account if max attempts reached
    if (attempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + AUTH_CONFIG.LOCKOUT_DURATION);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) {
    // Extract address from update data to handle separately
    const { address, ...userDataWithoutAddress } = updateData;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userDataWithoutAddress,
        // Handle address with proper Prisma nested input
        ...(address ? {
          address: {
            upsert: {
              create: address,
              update: address
            }
          }
        } : {})
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        status: true,
        kycStatus: true,
        tier: true,
        address: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error(ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, AUTH_CONFIG.BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        status: true,
        kycStatus: true,
        tier: true,
        riskLevel: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            accounts: true,
            kycDocuments: true
          }
        }
      }
    });

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Update user KYC status
   */
  static async updateKYCStatus(userId: string, status: 'PENDING' | 'VERIFIED' | 'REJECTED', notes?: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        kycStatus: status,
        ...(notes && { kycNotes: notes })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Suspend user account
   */
  static async suspendUser(userId: string, reason?: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'SUSPENDED',
        ...(reason && { suspensionReason: reason })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Reactivate user account
   */
  static async reactivateUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'ACTIVE',
        suspensionReason: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get users with pagination and filtering
   */
  static async getUsers(filters: {
    page?: number;
    limit?: number;
    status?: string;
    kycStatus?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, kycStatus, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          kycStatus: true,
          tier: true,
          riskLevel: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              accounts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}