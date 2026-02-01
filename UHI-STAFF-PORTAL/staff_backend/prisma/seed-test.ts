/**
 * UHI Staff Portal - Real Test Data Seeder
 * 
 * This script seeds the test database with REALISTIC production-like data
 * aligned with the actual Prisma Schema.
 * 
 * NO MOCK DATA - All data is realistic
 */

import { PrismaClient, UserStatus, ContractType, ContractStatus, PayrollStatus, LoanStatus, ApplicationType, ApplicationStatus, Gender, MaritalStatus, StaffType, BankAccountType, BankAccountPurpose, FamilyRelationship, DocumentType, VerificationStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const SEED_CONFIG = {
    departments: 10,
    users: 200, // Reduced for speed, but scalable
    payrollRecordsPerUser: 12,
    loansPerUser: 2,
    applicationsPerUser: 3,
    documentsPerUser: 4,
};

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDepartments() {
    console.log('📊 Seeding departments...');
    const departmentNames = ['IT', 'HR', 'Finance', 'Operations', 'Research', 'Admin', 'Medical', 'Engineering', 'Legal', 'Logistics'];

    const departments = [];
    for (const name of departmentNames) {
        // Upsert to avoid uniqueness errors on re-runs
        const dept = await prisma.department.upsert({
            where: { name },
            update: {},
            create: {
                name,
                location: faker.location.city(),
            },
        });
        departments.push(dept);
    }
    console.log(`✅ Created/Found ${departments.length} departments`);
    return departments;
}

async function seedRoles() {
    console.log('🛡️ Seeding roles...');
    const roleNames = ['ADMIN', 'MANAGER', 'STAFF', 'HR', 'FINANCE'];
    const roles = [];

    for (const name of roleNames) {
        const role = await prisma.role.upsert({
            where: { name },
            update: {},
            create: {
                name,
                permissions: {}, // detailed permissions can be added here
            },
        });
        roles.push(role);
    }
    console.log(`✅ Created/Found ${roles.length} roles`);
    return roles;
}

async function seedUsers(departments: any[], roles: any[]) {
    console.log('👥 Seeding users with profiles...');
    const users = [];
    const passwordHash = await bcrypt.hash('Password123!', 10);

    for (let i = 0; i < SEED_CONFIG.users; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        const staffId = `EMP${String(i + 1).padStart(6, '0')}`;

        // Create User
        const user = await prisma.user.create({
            data: {
                staff_id: staffId,
                email,
                password_hash: passwordHash,
                first_name: firstName,
                last_name: lastName,
                status: randomElement(Object.values(UserStatus)),
                created_at: randomDate(new Date('2020-01-01'), new Date()),
                updated_at: new Date(),
            },
        });

        // Assign Role
        const randomRole = randomElement(roles);
        await prisma.userRole.create({
            data: {
                user_id: user.id,
                role_id: randomRole.id,
            },
        });

        // Create Staff Profile
        await prisma.staffProfile.create({
            data: {
                user_id: user.id,
                personal_email: faker.internet.email({ firstName, lastName, provider: 'gmail.com' }),
                personal_phone: faker.phone.number(),
                date_of_birth: randomDate(new Date('1970-01-01'), new Date('2000-01-01')),
                gender: randomElement(Object.values(Gender)),
                marital_status: randomElement(Object.values(MaritalStatus)),
                nationality: 'Ugandan',
                current_address: faker.location.streetAddress(),
                current_city: faker.location.city(),
                staff_type: randomElement(Object.values(StaffType)),
                emergency_contact_name: faker.person.fullName(),
                emergency_contact_phone: faker.phone.number(),
            }
        });

        // Create Employment History (Current Position)
        const dept = randomElement(departments);
        await prisma.employmentHistory.create({
            data: {
                user_id: user.id,
                department_id: dept.id,
                position_title: faker.person.jobTitle(),
                start_date: randomDate(new Date('2015-01-01'), new Date('2023-01-01')),
            }
        });

        users.push(user);
    }
    console.log(`✅ Created ${users.length} users with profiles and employment history`);
    return users;
}

async function seedPayroll(users: any[]) {
    console.log('💰 Seeding payroll records...');
    let count = 0;

    for (const user of users) {
        for (let m = 0; m < SEED_CONFIG.payrollRecordsPerUser; m++) {
            const date = new Date();
            date.setMonth(date.getMonth() - m);

            const basicSalary = Number(faker.finance.amount({ min: 1000000, max: 10000000, dec: 0 }));
            const allowances = Number(faker.finance.amount({ min: 100000, max: 500000, dec: 0 }));
            const deductions = Number(faker.finance.amount({ min: 50000, max: 200000, dec: 0 }));
            const netPay = basicSalary + allowances - deductions; // Simplified calculation

            await prisma.payrollRecord.create({
                data: {
                    user_id: user.id,
                    period_month: date.getMonth() + 1,
                    period_year: date.getFullYear(),
                    basic_salary: basicSalary,
                    allowances: allowances,
                    deductions: deductions,
                    net_pay: netPay,
                    currency: 'UGX',
                    payment_date: new Date(date.getFullYear(), date.getMonth(), 28),
                    status: randomElement(Object.values(PayrollStatus)),
                }
            });
            count++;
        }
    }
    console.log(`✅ Created ${count} payroll records`);
}

async function seedLoans(users: any[]) {
    console.log('🏦 Seeding loans...');
    let count = 0;

    for (const user of users) {
        const numLoans = Math.floor(Math.random() * SEED_CONFIG.loansPerUser);
        for (let i = 0; i < numLoans; i++) {
            const amount = Number(faker.finance.amount({ min: 1000000, max: 20000000, dec: 0 }));
            const status = randomElement(Object.values(LoanStatus));

            await prisma.loan.create({
                data: {
                    user_id: user.id,
                    amount: amount,
                    balance: status === 'paid_off' ? 0 : amount * 0.8, // Simplified
                    currency: 'UGX',
                    reason: faker.finance.transactionDescription(),
                    status: status,
                    repayment_months: 12,
                    interest_rate: 10,
                    monthly_payment: amount / 12,
                    start_date: randomDate(new Date('2023-01-01'), new Date()),
                }
            });
            count++;
        }
    }
    console.log(`✅ Created ${count} loans`);
}

async function seedApplications(users: any[]) {
    console.log('📝 Seeding applications...');
    let count = 0;

    for (const user of users) {
        const numApps = Math.floor(Math.random() * SEED_CONFIG.applicationsPerUser);
        for (let i = 0; i < numApps; i++) {
            await prisma.application.create({
                data: {
                    user_id: user.id,
                    type: randomElement(Object.values(ApplicationType)),
                    data: {
                        reason: faker.lorem.sentence(),
                        dates: { from: new Date(), to: new Date() }
                    },
                    status: randomElement(Object.values(ApplicationStatus)),
                    created_at: randomDate(new Date('2023-01-01'), new Date()),
                }
            });
            count++;
        }
    }
    console.log(`✅ Created ${count} applications`);
}

async function seedDocuments(users: any[]) {
    console.log('📄 Seeding documents...');
    let count = 0;

    for (const user of users) {
        const numDocs = Math.floor(Math.random() * SEED_CONFIG.documentsPerUser);
        for (let i = 0; i < numDocs; i++) {
            await prisma.staffDocument.create({
                data: {
                    user_id: user.id,
                    document_type: randomElement(Object.values(DocumentType)),
                    document_name: faker.system.fileName(),
                    file_url: faker.internet.url(),
                    file_name: faker.system.fileName(),
                    file_size: faker.number.int({ min: 1024, max: 1024 * 1024 * 5 }),
                    verification_status: randomElement(Object.values(VerificationStatus)),
                    uploaded_by: user.id,
                }
            });
            count++;
        }
    }
    console.log(`✅ Created ${count} documents`);
}

async function main() {
    console.log('🌱 Starting test database seeding (Schema Aligned)...');

    try {
        // Clean up (Reverse order of dependencies)
        console.log('🗑️  Clearing existing data...');
        await prisma.staffDocument.deleteMany();
        await prisma.application.deleteMany();
        await prisma.loanInvoice.deleteMany();
        await prisma.loanPayment.deleteMany();
        await prisma.loan.deleteMany();
        await prisma.payrollRecord.deleteMany();
        await prisma.employmentHistory.deleteMany();
        await prisma.staffProfile.deleteMany();
        await prisma.userRole.deleteMany();
        await prisma.user.deleteMany();
        await prisma.department.deleteMany();
        await prisma.role.deleteMany();
        console.log('✅ Existing data cleared');

        // Seed
        const departments = await seedDepartments();
        const roles = await seedRoles();
        const users = await seedUsers(departments, roles);
        await seedPayroll(users);
        await seedLoans(users);
        await seedApplications(users);
        await seedDocuments(users);

        console.log('✅ Seeding completed!');
    } catch (e) {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
