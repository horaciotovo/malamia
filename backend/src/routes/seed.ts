import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma';

const router = Router();

// POST /api/seed/reset — Delete all data and reseed
router.post('/reset', async (req: Request, res: Response) => {
  try {
    console.log('🗑️  Clearing all data...');
    
    // Delete all data
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ All data cleared');
    
    // Now seed fresh data by reusing the seed logic
    req.url = '/'; // Trick to call the main seed logic
    seedDatabase(req, res);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/seed — Full database seeding (admin user, categories, products)
async function seedDatabase(req: Request, res: Response) {
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

    // ── Products (25+ items) ────────────────────────────────────────────────
    const productsData = [
      // Remeras
      { name: 'Remera Blanca Clásica', price: 29.99, compareAtPrice: 39.99, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'], stock: 100, isFeatured: true },
      { name: 'Remera Negra Básica', price: 29.99, compareAtPrice: 39.99, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], stock: 95, isFeatured: true },
      { name: 'Remera Gris Oversize', price: 34.99, compareAtPrice: 45.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'], stock: 85, isFeatured: false },
      { name: 'Remera Estampada Colores', price: 39.99, compareAtPrice: 49.99, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1576566588286-c1fe8e1e5d6d?w=600'], stock: 70, isFeatured: true },
      { name: 'Remera Rosa Pastel', price: 32.99, compareAtPrice: 42.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1576566588286-c1fe8e1e5d6d?w=600'], stock: 80, isFeatured: false },
      { name: 'Remera Azul Marino', price: 30.99, compareAtPrice: 40.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600'], stock: 90, isFeatured: false },
      { name: 'Remera Verde Menta', price: 33.99, compareAtPrice: 44.00, categorySlug: 'remeras', images: ['https://images.unsplash.com/photo-1600428877878-1a0fd85beda8?w=600'], stock: 75, isFeatured: false },
      
      // Jeans
      { name: 'Jean Skinny Azul Oscuro', price: 59.99, compareAtPrice: 79.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600'], stock: 65, isFeatured: true },
      { name: 'Jean Slim Clásico', price: 64.99, compareAtPrice: 84.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1514886286974-6c03bf463b2f?w=600'], stock: 60, isFeatured: true },
      { name: 'Jean Roto Diseño', price: 69.99, compareAtPrice: 89.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1538002588580-374a6b5f7556?w=600'], stock: 55, isFeatured: false },
      { name: 'Jean Mom Fit', price: 64.99, compareAtPrice: 84.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1505886711169-3cbb0d50e7e0?w=600'], stock: 70, isFeatured: false },
      { name: 'Jean Azul Claro', price: 54.99, compareAtPrice: 74.99, categorySlug: 'jeans', images: ['https://images.unsplash.com/photo-1519156677039-dbf319e37221?w=600'], stock: 80, isFeatured: false },
      
      // Shorts
      { name: 'Short Denim Clásico', price: 39.99, compareAtPrice: 49.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1506149613881-63e37a3a15e6?w=600'], stock: 90, isFeatured: true },
      { name: 'Short Deportivo Negro', price: 34.99, compareAtPrice: 44.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1574701148212-403bdad855b7?w=600'], stock: 100, isFeatured: false },
      { name: 'Short Khaki', price: 44.99, compareAtPrice: 54.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600'], stock: 75, isFeatured: false },
      { name: 'Short Blanco Verano', price: 39.99, compareAtPrice: 49.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1473081169829-3e50ee752eed?w=600'], stock: 85, isFeatured: true },
      { name: 'Short Rojo Deportivo', price: 37.99, compareAtPrice: 47.99, categorySlug: 'shorts', images: ['https://images.unsplash.com/photo-1622551693241-abc0ded2f5d0?w=600'], stock: 80, isFeatured: false },
      
      // Polleras
      { name: 'Pollera Negra Elegante', price: 54.99, compareAtPrice: 69.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1543163521-9145f2c86899?w=600'], stock: 55, isFeatured: true },
      { name: 'Pollera Jean Azul', price: 59.99, compareAtPrice: 74.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1502716808539-be3f45dd333e?w=600'], stock: 50, isFeatured: true },
      { name: 'Pollera Gris Casual', price: 49.99, compareAtPrice: 64.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'], stock: 60, isFeatured: false },
      { name: 'Pollera Estampada Flores', price: 64.99, compareAtPrice: 79.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=600'], stock: 45, isFeatured: false },
      { name: 'Pollera Mini Negra', price: 52.99, compareAtPrice: 67.99, categorySlug: 'polleras', images: ['https://images.unsplash.com/photo-1560807707-6cc04b73a39d?w=600'], stock: 65, isFeatured: false },
      
      // Bodys
      { name: 'Body Blanco Básico', price: 24.99, compareAtPrice: 34.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1488161628813-04466f592e48?w=600'], stock: 120, isFeatured: true },
      { name: 'Body Negro Elegante', price: 26.99, compareAtPrice: 36.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], stock: 110, isFeatured: true },
      { name: 'Body Estampado Colores', price: 31.99, compareAtPrice: 41.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1506150613881-a3f6228a6c1d?w=600'], stock: 95, isFeatured: false },
      { name: 'Body Rojo Pasión', price: 27.99, compareAtPrice: 37.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1520006348518-bc99f7265051?w=600'], stock: 100, isFeatured: false },
      { name: 'Body Azul Marino', price: 25.99, compareAtPrice: 35.99, categorySlug: 'bodys', images: ['https://images.unsplash.com/photo-1512207736139-795b8f15ef04?w=600'], stock: 105, isFeatured: false },
    ];

    let productsCreated = 0;
    let productsUpdated = 0;
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
      } else if (existing && categories[prod.categorySlug]) {
        // Update existing product with new images and prices
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            images: prod.images,
            price: prod.price,
            compareAtPrice: prod.compareAtPrice,
            stock: prod.stock,
            isFeatured: prod.isFeatured,
          },
        });
        productsUpdated++;
      }
    }
    console.log(`✅ ${productsCreated} products created, ${productsUpdated} products updated`);

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
}

router.post('/', seedDatabase);

export default router;
