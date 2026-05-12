#!/usr/bin/env node
/**
 * Script to list all admin users
 * Usage: node scripts/list-admins.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in the database');
      process.exit(0);
    }

    console.log('\n✅ Admin Users Found:\n');
    console.log('─'.repeat(80));
    
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.firstName} ${admin.lastName}`);
      console.log(`   📧 Email:    ${admin.email}`);
      console.log(`   🔐 Role:     ${admin.role}`);
      console.log(`   ✔️  Active:    ${admin.isActive ? 'Yes' : 'No'}`);
      console.log(`   📅 Created:   ${new Date(admin.createdAt).toLocaleString()}`);
      console.log(`   📅 Updated:   ${new Date(admin.updatedAt).toLocaleString()}`);
    });
    
    console.log('\n' + '─'.repeat(80));
    console.log(`\nTotal: ${admins.length} admin user${admins.length > 1 ? 's' : ''}\n`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error fetching admin users:', errorMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
