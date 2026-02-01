import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import TEST_CONFIG from '../config/test.config';

export class TestHelpers {
  private static prisma = new PrismaClient({
    datasources: { db: { url: TEST_CONFIG.database.connectionString } },
  });

  static async createTestUser(role: string = 'STAFF') {
    const email = `test.${Date.now()}@uhi.org`;
    const user = await this.prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('TestPassword123!', 10),
        firstName: 'Test',
        lastName: 'User',
        role,
        isActive: true,
      },
    });
    return { user, password: 'TestPassword123!' };
  }

  static async cleanupTestUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }

  static generateTestFile(size: number = 1024) {
    return Buffer.alloc(size, 'test');
  }

  static async disconnect() {
    await this.prisma.$disconnect();
  }
}
