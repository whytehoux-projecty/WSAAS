import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("Setting up test environment...");

  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    "postgresql://test:test@localhost:5432/novabank_admin_test";

  try {
    // Reset test database
    console.log("Resetting test database...");
    execSync("npx prisma migrate reset --force --skip-seed", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    // Run migrations
    console.log("Running database migrations...");
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    // Generate Prisma client
    console.log("Generating Prisma client...");
    execSync("npx prisma generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    console.log("Test environment setup complete.");
  } catch (error) {
    console.error("Failed to setup test environment:", error);
    process.exit(1);
  }
}
