#!/usr/bin/env node
/**
 * Helper script to promote a customer to admin role
 * Usage: node scripts/promote-admin.js <email>
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function promoteToAdmin(email) {
  if (!email) {
    console.error('❌ Usage: node scripts/promote-admin.js <email>');
    console.error('Example: node scripts/promote-admin.js admin@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`ℹ️  User ${email} is already an admin.`);
      process.exit(0);
    }

    const updated = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    console.log('✅ User promoted to admin:');
    console.log(`   📧 Email: ${updated.email}`);
    console.log(`   👤 Name:  ${updated.firstName} ${updated.lastName}`);
    console.log(`   🔐 Role:  ${updated.role}`);
    console.log('');
    console.log('They can now login at the backoffice with their credentials.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error promoting user:', errorMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
promoteToAdmin(email);
