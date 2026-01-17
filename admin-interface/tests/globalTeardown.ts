import { prisma } from "../src/lib/prisma";

export default async function globalTeardown() {
  console.log("Cleaning up test environment...");

  try {
    // Disconnect from database
    await prisma.$disconnect();
    console.log("Test environment cleanup complete.");
  } catch (error) {
    console.error("Failed to cleanup test environment:", error);
  }
}
