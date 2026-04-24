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
      { name: 'Remeras', slug: 'remeras', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', sortOrder: 1 },
      { name: 'Jeans', slug: 'jeans', image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400', sortOrder: 2 },
      { name: 'Shorts', slug: 'shorts', image: 'https://images.unsplash.com/photo-1506629082847-11d3e392e1d5?w=400', sortOrder: 3 },
      { name: 'Polleras', slug: 'polleras', image: 'https://images.unsplash.com/photo-1583496661160-fb5b0c628d8f?w=400', sortOrder: 4 },
      { name: 'Bodys', slug: 'bodys', image: 'https://images.unsplash.com/photo-1506146568402-b0b080d8f59b?w=400', sortOrder: 5 },
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
      // Remeras
      { name: 'Remera Blanca Clásica', price: 29.99, compareAtPrice: 39.99, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'], stock: 100, isFeatured: true },
      { name: 'Remera Negra Básica', price: 29.99, compareAtPrice: 39.99, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1593642532400-2682a8a672e5?w=600'], stock: 95, isFeatured: true },
      { name: 'Remera Gris Oversize', price: 34.99, compareAtPrice: 45.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1506629082847-11d3e392e1d5?w=600'], stock: 85, isFeatured: false },
      { name: 'Remera Estampada Colores', price: 39.99, compareAtPrice: 49.99, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1608231387042-ec033da64485?w=600'], stock: 70, isFeatured: true },
      { name: 'Remera Rosa Pastel', price: 32.99, compareAtPrice: 42.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1576566588286-c1fe8e1e5d6d?w=600'], stock: 80, isFeatured: false },
      { name: 'Remera Azul Marino', price: 30.99, compareAtPrice: 40.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600'], stock: 90, isFeatured: false },
      { name: 'Remera Verde Menta', price: 33.99, compareAtPrice: 44.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], stock: 75, isFeatured: false },
      
      // Jeans
      { name: 'Jean Skinny Azul Oscuro', price: 59.99, compareAtPrice: 79.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600'], stock: 65, isFeatured: true },
      { name: 'Jean Slim Clásico', price: 64.99, compareAtPrice: 84.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1542821131-44ed10dd0b30?w=600'], stock: 60, isFeatured: true },
      { name: 'Jean Roto Diseño', price: 69.99, compareAtPrice: 89.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1538002588580-374a6b5f7556?w=600'], stock: 55, isFeatured: false },
      { name: 'Jean Mom Fit', price: 64.99, compareAtPrice: 84.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1505886711169-3cbb0d50e7e0?w=600'], stock: 70, isFeatured: false },
      { name: 'Jean Azul Claro', price: 54.99, compareAtPrice: 74.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600'], stock: 80, isFeatured: false },
      
      // Shorts
      { name: 'Short Denim Clásico', price: 39.99, compareAtPrice: 49.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1506629082847-11d3e392e1d5?w=600'], stock: 90, isFeatured: true },
      { name: 'Short Deportivo Negro', price: 34.99, compareAtPrice: 44.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1574701148212-403bdad855b7?w=600'], stock: 100, isFeatured: false },
      { name: 'Short Khaki', price: 44.99, compareAtPrice: 54.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1517922550989-4eb93e53a526?w=600'], stock: 75, isFeatured: false },
      { name: 'Short Blanco Verano', price: 39.99, compareAtPrice: 49.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1553224311-beab87adad81?w=600'], stock: 85, isFeatured: true },
      { name: 'Short Rojo Deportivo', price: 37.99, compareAtPrice: 47.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1622551693241-abc0ded2f5d0?w=600'], stock: 80, isFeatured: false },
      
      // Polleras
      { name: 'Pollera Negra Elegante', price: 54.99, compareAtPrice: 69.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1583496661160-fb5b0c628d8f?w=600'], stock: 55, isFeatured: true },
      { name: 'Pollera Jean Azul', price: 59.99, compareAtPrice: 74.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1518991669915-b8d1c1e98e2f?w=600'], stock: 50, isFeatured: true },
      { name: 'Pollera Gris Casual', price: 49.99, compareAtPrice: 64.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1543163521-9145f2c86899?w=600'], stock: 60, isFeatured: false },
      { name: 'Pollera Estampada Flores', price: 64.99, compareAtPrice: 79.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1502716808539-be3f45dd333e?w=600'], stock: 45, isFeatured: false },
      { name: 'Pollera Mini Negra', price: 52.99, compareAtPrice: 67.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1595948361372-9ab337e92e8e?w=600'], stock: 65, isFeatured: false },
      
      // Bodys
      { name: 'Body Blanco Básico', price: 24.99, compareAtPrice: 34.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1506629082847-11d3e392e1d5?w=600'], stock: 120, isFeatured: true },
      { name: 'Body Negro Elegante', price: 26.99, compareAtPrice: 36.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1506146568402-b0b080d8f59b?w=600'], stock: 110, isFeatured: true },
      { name: 'Body Estampado Colores', price: 31.99, compareAtPrice: 41.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1544526017-2ab06e4c4c04?w=600'], stock: 95, isFeatured: false },
      { name: 'Body Rojo Pasión', price: 27.99, compareAtPrice: 37.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1542821131-44ed10dd0b30?w=600'], stock: 100, isFeatured: false },
      { name: 'Body Azul Marino', price: 25.99, compareAtPrice: 35.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1512207736139-795b8f15ef04?w=600'], stock: 105, isFeatured: false },
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
