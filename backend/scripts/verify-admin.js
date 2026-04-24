#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'htovoadmin@gmail.com' },
      select: { id: true, email: true, firstName: true, role: true, isActive: true },
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log(JSON.stringify(user, null, 2));

    if (user.role !== 'ADMIN') {
      console.log('\n⚠️  User is not ADMIN! Current role:', user.role);
      process.exit(1);
    }

    console.log('\n✅ User is ADMIN');
  } catch (error) {
    console.error('Error:', (error instanceof Error ? error.message : String(error)));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
