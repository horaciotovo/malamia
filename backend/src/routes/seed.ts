import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma';

const router = Router();

// POST /api/seed — Full database seeding (admin user, categories, products)
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('🌱 Starting full database seed...');
    
    // ── Admin User ──────────────────────────────────────────────────────────
    let adminCreated = false;
    const adminEmail = 'htovoadmin@gmail.com';
    const adminPassword = 'admin123456';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });
      adminCreated = true;
      console.log(`✅ Admin user created: ${adminEmail}`);
    }

    // ── Categories ─────────────────────────────────────────────────────────
    const categoryData = [
      { name: 'Skincare', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', sortOrder: 1 },
      { name: 'Hair Care', slug: 'haircare', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', sortOrder: 2 },
      { name: 'Makeup', slug: 'makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', sortOrder: 3 },
      { name: 'Fragrances', slug: 'fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400', sortOrder: 4 },
      { name: 'Body Care', slug: 'body-care', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', sortOrder: 5 },
    ];

    let categoriesCreated = 0;
    const categories: any = {};
    for (const cat of categoryData) {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        categories[cat.slug] = await prisma.category.create({ data: cat });
        categoriesCreated++;
      } else {
        categories[cat.slug] = existing;
      }
    }
    console.log(`✅ ${categoriesCreated} categories created`);

    // ── Products (20+ items) ────────────────────────────────────────────────
    const productsData = [
      // Skincare
      { name: 'Radiance Vitamin C Serum', price: 42.99, compareAtPrice: 59.99, categorySlug: 'skincare', images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'], stock: 85, isFeatured: true },
      { name: 'Hydra Boost Moisturiser', price: 34.50, compareAtPrice: null, categorySlug: 'skincare', images: ['https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=600'], stock: 120, isFeatured: true },
      { name: 'Gentle Foaming Cleanser', price: 18.99, compareAtPrice: null, categorySlug: 'skincare', images: ['https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=600'], stock: 200, isFeatured: false },
      { name: 'Retinol Night Repair Cream', price: 54.00, compareAtPrice: 68.00, categorySlug: 'skincare', images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600'], stock: 60, isFeatured: true },
      { name: 'Anti-Aging Eye Serum', price: 38.00, compareAtPrice: 48.00, categorySlug: 'skincare', images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600'], stock: 75, isFeatured: false },
      { name: 'Hydrating Sheet Mask', price: 12.99, compareAtPrice: 16.99, categorySlug: 'skincare', images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'], stock: 150, isFeatured: false },
      
      // Hair Care
      { name: 'Argan Oil Repair Shampoo', price: 22.00, compareAtPrice: null, categorySlug: 'haircare', images: ['https://images.unsplash.com/photo-1637418553553-c6f00c27e41a?w=600'], stock: 150, isFeatured: true },
      { name: 'Deep Conditioning Mask', price: 28.50, compareAtPrice: 35.00, categorySlug: 'haircare', images: ['https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600'], stock: 90, isFeatured: true },
      { name: 'Keratin Hair Treatment', price: 45.00, compareAtPrice: 60.00, categorySlug: 'haircare', images: ['https://images.unsplash.com/photo-1543241861-cbf41eb00340?w=600'], stock: 55, isFeatured: false },
      { name: 'Volumizing Conditioner', price: 19.99, compareAtPrice: null, categorySlug: 'haircare', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], stock: 120, isFeatured: false },
      { name: 'Anti-Frizz Serum', price: 24.50, compareAtPrice: 32.00, categorySlug: 'haircare', images: ['https://images.unsplash.com/photo-1596289519420-adc7cff1e1c4?w=600'], stock: 80, isFeatured: false },
      { name: 'Scalp Treatment Oil', price: 31.00, compareAtPrice: 42.00, categorySlug: 'haircare', images: ['https://images.unsplash.com/photo-1633426308639-a3b98a35ffe8?w=600'], stock: 65, isFeatured: false },
      
      // Makeup
      { name: 'Matte Liquid Lipstick', price: 16.99, compareAtPrice: 22.00, categorySlug: 'makeup', images: ['https://images.unsplash.com/photo-1533737710307-6871ac3c33d9?w=600'], stock: 200, isFeatured: true },
      { name: 'Foundation Primer', price: 28.00, compareAtPrice: 35.00, categorySlug: 'makeup', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], stock: 110, isFeatured: false },
      { name: 'Eyeshadow Palette', price: 35.99, compareAtPrice: 49.99, categorySlug: 'makeup', images: ['https://images.unsplash.com/photo-1513063693919-ab349dd3f348?w=600'], stock: 70, isFeatured: true },
      { name: 'Mascara Volume Plus', price: 19.99, compareAtPrice: 26.00, categorySlug: 'makeup', images: ['https://images.unsplash.com/photo-1580707100604-45d3a86e5586?w=600'], stock: 160, isFeatured: false },
      { name: 'Blush Powder Compact', price: 14.50, compareAtPrice: 19.00, categorySlug: 'makeup', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], stock: 140, isFeatured: false },
      
      // Fragrances
      { name: 'Floral Eau de Parfum', price: 79.00, compareAtPrice: 99.00, categorySlug: 'fragrances', images: ['https://images.unsplash.com/photo-1524457600899-b8b0e3c7beef?w=600'], stock: 45, isFeatured: true },
      { name: 'Citrus Fresh Cologne', price: 59.99, compareAtPrice: 75.00, categorySlug: 'fragrances', images: ['https://images.unsplash.com/photo-1547887538-e3a2c3fb3c0f?w=600'], stock: 55, isFeatured: false },
      { name: 'Woody Musk Perfume', price: 85.50, compareAtPrice: 110.00, categorySlug: 'fragrances', images: ['https://images.unsplash.com/photo-1592887720694-26d35a50ee38?w=600'], stock: 35, isFeatured: true },
      
      // Body Care
      { name: 'Luxe Body Lotion', price: 24.99, compareAtPrice: 32.00, categorySlug: 'body-care', images: ['https://images.unsplash.com/photo-1556228720-8973a46912d5?w=600'], stock: 140, isFeatured: true },
      { name: 'Scrub Body Exfoliant', price: 18.50, compareAtPrice: 24.00, categorySlug: 'body-care', images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'], stock: 95, isFeatured: false },
      { name: 'Rosehip Body Oil', price: 32.00, compareAtPrice: 42.00, categorySlug: 'body-care', images: ['https://images.unsplash.com/photo-1556214014412-696021355e3f?w=600'], stock: 70, isFeatured: true },
    ];

    let productsCreated = 0;
    for (const prod of productsData) {
      const existing = await prisma.product.findFirst({ where: { name: prod.name } });
      if (!existing && categories[prod.categorySlug]) {
        await prisma.product.create({
          data: {
            name: prod.name,
            description: `High-quality ${prod.name} for professional use.`,
            price: prod.price,
            compareAtPrice: prod.compareAtPrice,
            categoryId: categories[prod.categorySlug].id,
            images: prod.images,
            stock: prod.stock,
            isPublished: true,
            isFeatured: prod.isFeatured,
            tags: [prod.name.toLowerCase()],
          },
        });
        productsCreated++;
      }
    }
    console.log(`✅ ${productsCreated} products created (${productsData.length - productsCreated} already existed)`);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        adminCreated,
        categoriesCreated,
        productsCreated,
        totalProducts: productsData.length,
        credentials: adminCreated ? { email: adminEmail, password: adminPassword } : null,
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
