#!/usr/bin/env node
/**
 * Script to reset a user's password
 * Usage: node scripts/reset-password.js <email> <new-password>
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  if (!email || !newPassword) {
    console.error('❌ Usage: node scripts/reset-password.js <email> <new-password>');
    console.error('Example: node scripts/reset-password.js htovoadmin@gmail.com admin123456');
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

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    console.log('✅ Password reset successfully:');
    console.log(`   📧 Email:    ${updated.email}`);
    console.log(`   👤 Name:     ${updated.firstName} ${updated.lastName}`);
    console.log(`   🔐 Role:     ${updated.role}`);
    console.log(`   🔑 Password: ${newPassword}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error resetting password:', errorMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword(process.argv[2], process.argv[3]);
