import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  // Disable foreign key checks temporarily
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

  try {
    // Truncate all tables
    await prisma.auditLog.deleteMany();
    await prisma.adminSession.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.kycDocument.deleteMany();
    await prisma.wireTransfer.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await prisma.fxRate.deleteMany();
  } finally {
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
  }
}

export async function setupTestData() {
  // No need to create AdminRole entries as they are now part of AdminUser directly
  console.log("Test data setup completed");
}

// Global setup
beforeAll(async () => {
  await cleanDatabase();
  await setupTestData();
});

// Clean up after each test
afterEach(async () => {
  await cleanDatabase();
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});
