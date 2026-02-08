import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { 
  generateAccountNumber, 
  generateTransactionId, 
  generateWireTransferReference 
} from '../shared/utils/generators';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin users
  console.log('👤 Creating admin users...');
  
  const adminPassword = await bcrypt.hash('admin123!', 12);
// Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aurumvault.com' },
    update: {},
    create: {
      email: 'admin@aurumvault.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0100',
      dateOfBirth: new Date('1980-01-01'),
      address: {
        street: '123 Admin Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      kycCompletedAt: new Date(),
    },
  });

  await prisma.adminUser.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      isActive: true,
    },
  });

  // Create sample customers
  console.log('👥 Creating sample customers...');
  
  const customers = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1985-06-15'),
      address: {
        street: '456 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US',
      },
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0102',
      dateOfBirth: new Date('1990-03-22'),
      address: {
        street: '789 Oak Avenue',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'US',
      },
    },
    {
      email: 'mike.johnson@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-0103',
      dateOfBirth: new Date('1988-11-08'),
      address: {
        street: '321 Pine Road',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'US',
      },
    },
  ];

  const createdUsers = [];
  for (const customer of customers) {
    const password = await bcrypt.hash('password123!', 12);
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        ...customer,
        passwordHash: password,
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
        kycCompletedAt: new Date(),
      },
    });
    createdUsers.push(user);
  }

  // Create accounts for customers
  console.log('🏦 Creating bank accounts...');
  
  const accountTypes = ['CHECKING', 'SAVINGS', 'BUSINESS'];
  const createdAccounts = [];

  for (const user of createdUsers) {
    // Create checking account
    const checkingAccount = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: generateAccountNumber(),
        accountType: 'CHECKING',
        balance: Math.floor(Math.random() * 50000) + 5000, // $5,000 - $55,000
        availableBalance: 0, // Will be set to balance
        currency: 'USD',
        status: 'ACTIVE',
        bankName: 'Aurum Vault',
        routingNumber: '021000021',
      },
    });

    // Update available balance
    await prisma.account.update({
      where: { id: checkingAccount.id },
      data: { availableBalance: checkingAccount.balance },
    });

    createdAccounts.push(checkingAccount);

    // Create savings account for some users
    if (Math.random() > 0.3) {
      const savingsAccount = await prisma.account.create({
        data: {
          userId: user.id,
          accountNumber: generateAccountNumber(),
          accountType: 'SAVINGS',
          balance: Math.floor(Math.random() * 100000) + 10000, // $10,000 - $110,000
          availableBalance: 0,
          currency: 'USD',
          status: 'ACTIVE',
          bankName: 'Aurum Vault',
          routingNumber: '021000021',
        },
      });

      await prisma.account.update({
        where: { id: savingsAccount.id },
        data: { availableBalance: savingsAccount.balance },
      });

      createdAccounts.push(savingsAccount);
    }
  }

  // Create sample transactions
  console.log('💳 Creating sample transactions...');
  
  const transactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'];
  const descriptions = [
    'Direct Deposit - Salary',
    'ATM Withdrawal',
    'Online Transfer',
    'Bill Payment - Utilities',
    'Check Deposit',
    'Wire Transfer',
    'Merchant Payment',
    'Interest Payment',
  ];

  for (let i = 0; i < 50; i++) {
    const account = createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = Math.floor(Math.random() * 2000) + 10; // $10 - $2,010
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Create transaction date within last 30 days
    const transactionDate = new Date();
    transactionDate.setDate(transactionDate.getDate() - Math.floor(Math.random() * 30));

    await prisma.transaction.create({
      data: {
        id: generateTransactionId(),
        fromAccountId: transactionType === 'WITHDRAWAL' || transactionType === 'PAYMENT' ? account.id : undefined,
        toAccountId: transactionType === 'DEPOSIT' || transactionType === 'TRANSFER' ? account.id : undefined,
        amount,
        type: transactionType,
        status: 'COMPLETED',
        description,
        createdAt: transactionDate,
        completedAt: transactionDate,
        metadata: {
          channel: Math.random() > 0.5 ? 'ONLINE' : 'ATM',
          location: 'New York, NY',
        },
      },
    });
  }

  // Create sample wire transfers
  console.log('🌐 Creating sample wire transfers...');
  
  for (let i = 0; i < 10; i++) {
    const fromAccount = createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
    const amount = Math.floor(Math.random() * 10000) + 1000; // $1,000 - $11,000
    const type = Math.random() > 0.5 ? 'DOMESTIC' : 'INTERNATIONAL';
    
    const wireTransferDate = new Date();
    wireTransferDate.setDate(wireTransferDate.getDate() - Math.floor(Math.random() * 15));

    await prisma.wireTransfer.create({
      data: {
        referenceNumber: generateWireTransferReference(),
        fromAccountId: fromAccount.id,
        amount,
        fee: type === 'INTERNATIONAL' ? 45 : 25,
        currency: 'USD',
        type,
        purpose: 'Business Payment',
        beneficiaryName: `Beneficiary ${i + 1}`,
        beneficiaryAddress: {
          street: '123 Beneficiary St',
          city: 'Beneficiary City',
          state: 'BC',
          zipCode: '12345',
          country: type === 'INTERNATIONAL' ? 'CA' : 'US',
        },
        beneficiaryBankName: `Bank ${i + 1}`,
        beneficiaryBankAddress: {
          street: '456 Bank St',
          city: 'Bank City',
          state: 'BC',
          zipCode: '67890',
          country: type === 'INTERNATIONAL' ? 'CA' : 'US',
        },
        swiftCode: type === 'INTERNATIONAL' ? 'BANKCA22' : undefined,
        routingNumber: type === 'DOMESTIC' ? '021000021' : undefined,
        accountNumber: `ACC${String(i + 1).padStart(10, '0')}`,
        status: Math.random() > 0.2 ? 'COMPLETED' : 'PENDING',
        createdAt: wireTransferDate,
        completedAt: Math.random() > 0.2 ? wireTransferDate : undefined,
      },
    });
  }

  // Create sample KYC documents
  console.log('📄 Creating sample KYC documents...');
  
  for (const user of createdUsers) {
    // Government ID
    await prisma.kYCDocument.create({
      data: {
        userId: user.id,
        type: 'GOVERNMENT_ID',
        fileName: `${user.firstName}_${user.lastName}_ID.pdf`,
        filePath: `/uploads/kyc/${user.id}/government_id.pdf`,
        fileSize: 1024 * 1024, // 1MB
        mimeType: 'application/pdf',
        status: 'VERIFIED',
        reviewedAt: new Date(),
        reviewNotes: 'Document verified successfully',
      },
    });

    // Proof of Address
    await prisma.kYCDocument.create({
      data: {
        userId: user.id,
        type: 'PROOF_OF_ADDRESS',
        fileName: `${user.firstName}_${user.lastName}_Address.pdf`,
        filePath: `/uploads/kyc/${user.id}/proof_of_address.pdf`,
        fileSize: 512 * 1024, // 512KB
        mimeType: 'application/pdf',
        status: 'VERIFIED',
        reviewedAt: new Date(),
        reviewNotes: 'Address verified successfully',
      },
    });
  }

  // Create audit logs
  console.log('📋 Creating audit logs...');
  
  for (const user of [...createdUsers, adminUser]) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: { loginMethod: 'email' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(),
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Created ${createdUsers.length + 1} users (including admin)`);
  console.log(`- Created ${createdAccounts.length} bank accounts`);
  console.log('- Created 50 sample transactions');
  console.log('- Created 10 sample wire transfers');
  console.log(`- Created ${createdUsers.length * 2} KYC documents`);
  console.log(`- Created ${createdUsers.length + 1} audit log entries`);
  
  console.log('\n🔐 Admin Credentials:');
  console.log('Email: admin@aurumvault.com');
  console.log('Password: admin123!');
  
  console.log('\n👤 Sample Customer Credentials:');
  customers.forEach(customer => {
    console.log(`Email: ${customer.email} | Password: password123!`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });