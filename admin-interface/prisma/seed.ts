import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create default super admin user
  console.log("Creating default super admin user...");

  const hashedPassword = await bcrypt.hash("SuperAdmin123!", 12);

  const superAdmin = await prisma.adminUser.upsert({
    where: { email: "superadmin@novabank.com" },
    update: {},
    create: {
      email: "superadmin@novabank.com",
      firstName: "Super",
      lastName: "Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      permissions: [
        "READ_USERS",
        "UPDATE_USER_STATUS",
        "UPDATE_USER_KYC",
        "READ_TRANSACTIONS",
        "UPDATE_TRANSACTION_STATUS",
        "READ_WIRE_TRANSFERS",
        "UPDATE_WIRE_TRANSFER_STATUS",
        "READ_AUDIT_LOGS",
        "READ_DASHBOARD",
        "MANAGE_ADMINS",
        "SYSTEM_SETTINGS",
      ],
      status: "ACTIVE",
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Super admin user created");

  // Create default admin user
  console.log("Creating default admin user...");

  const adminHashedPassword = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@novabank.com" },
    update: {},
    create: {
      email: "admin@novabank.com",
      firstName: "Admin",
      lastName: "User",
      password: adminHashedPassword,
      role: "ADMIN",
      permissions: [
        "READ_USERS",
        "UPDATE_USER_STATUS",
        "READ_TRANSACTIONS",
        "READ_WIRE_TRANSFERS",
        "READ_AUDIT_LOGS",
        "READ_DASHBOARD",
      ],
      status: "ACTIVE",
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Admin user created");

  // Create some sample users for testing
  console.log("Creating sample users...");

  const sampleUsers = [
    {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      dateOfBirth: new Date("1990-01-15"),
      status: "ACTIVE",
      kycStatus: "VERIFIED",
    },
    {
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+1234567891",
      dateOfBirth: new Date("1985-05-20"),
      status: "ACTIVE",
      kycStatus: "PENDING",
    },
    {
      email: "bob.johnson@example.com",
      firstName: "Bob",
      lastName: "Johnson",
      phone: "+1234567892",
      dateOfBirth: new Date("1992-08-10"),
      status: "SUSPENDED",
      kycStatus: "REJECTED",
    },
  ];

  for (const userData of sampleUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: await bcrypt.hash("User123!", 12),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log("✅ Sample users created");

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Default Admin Credentials:");
  console.log("Super Admin:");
  console.log("  Email: superadmin@novabank.com");
  console.log("  Password: SuperAdmin123!");
  console.log("\nAdmin:");
  console.log("  Email: admin@novabank.com");
  console.log("  Password: Admin123!");
  console.log("\n⚠️  Please change these default passwords in production!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
