import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma';

const router = Router();

// POST /api/seed — Initialize admin user (only works if users table is empty)
router.post('/seed', async (req: Request, res: Response) => {
  try {
    // Check if users already exist
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      res.status(400).json({
        success: false,
        message: 'Database already has users. Seeding skipped.',
      });
      return;
    }

    // Create admin user
    const adminEmail = 'htovoadmin@gmail.com';
    const adminPassword = 'admin123456'; // Change this to something secure
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log(`✅ Admin user created: ${adminEmail}`);

    res.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        role: admin.role,
        credentials: {
          email: adminEmail,
          password: adminPassword,
        },
      },
    });
  } catch (error) {
    console.error('❌ Seed failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
