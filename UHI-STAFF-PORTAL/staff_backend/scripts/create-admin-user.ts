#!/usr/bin/env ts-node
/**
 * Create Admin User Script
 * 
 * This script creates a new admin user with superadmin privileges.
 * 
 * Usage:
 *   npm run create-admin
 *   or
 *   npx ts-node scripts/create-admin-user.ts
 * 
 * You will be prompted for:
 * - Staff ID
 * - Email
 * - Password
 * - First Name
 * - Last Name
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function createAdminUser() {
    console.log('\n🔐 Create Admin User\n');
    console.log('This script will create a new admin user with superadmin privileges.\n');

    try {
        // Get user input
        const staffId = await question('Enter Staff ID (e.g., ADMIN-002): ');
        const email = await question('Enter Email: ');
        const password = await question('Enter Password (min 8 chars): ');
        const firstName = await question('Enter First Name: ');
        const lastName = await question('Enter Last Name: ');

        // Validate inputs
        if (!staffId || !email || !password || !firstName || !lastName) {
            console.error('❌ All fields are required!');
            process.exit(1);
        }

        if (password.length < 8) {
            console.error('❌ Password must be at least 8 characters long!');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { staff_id: staffId },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            console.error('❌ User with this Staff ID or Email already exists!');
            process.exit(1);
        }

        // Hash password
        console.log('\n🔒 Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        console.log('👤 Creating user...');
        const user = await prisma.user.create({
            data: {
                staff_id: staffId,
                email: email,
                password_hash: passwordHash,
                first_name: firstName,
                last_name: lastName,
                status: 'active',
            }
        });

        // Get admin role
        const adminRole = await prisma.role.findUnique({
            where: { name: 'admin' }
        });

        if (!adminRole) {
            console.error('❌ Admin role not found! Please run database seed first.');
            process.exit(1);
        }

        // Assign admin role
        console.log('🔑 Assigning admin role...');
        await prisma.userRole.create({
            data: {
                user_id: user.id,
                role_id: adminRole.id
            }
        });

        console.log('\n✅ Admin user created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Staff ID: ${staffId}`);
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  Please save these credentials securely!\n');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Run the script
createAdminUser();
