import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'skincare' },
      update: {},
      create: {
        name: 'Skincare',
        slug: 'skincare',
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'haircare' },
      update: {},
      create: {
        name: 'Hair Care',
        slug: 'haircare',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'makeup' },
      update: {},
      create: {
        name: 'Makeup',
        slug: 'makeup',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fragrances' },
      update: {},
      create: {
        name: 'Fragrances',
        slug: 'fragrances',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'body-care' },
      update: {},
      create: {
        name: 'Body Care',
        slug: 'body-care',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
        sortOrder: 5,
      },
    }),
  ]);

  const [skincare, haircare, makeup, fragrances, bodycare] = categories;
  console.log(`✅ ${categories.length} categories created`);

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = [
    // Skincare
    {
      name: 'Radiance Vitamin C Serum',
      description: 'A brightening serum packed with 15% pure Vitamin C, niacinamide, and hyaluronic acid. Reduces dark spots, evens skin tone, and leaves skin glowing.',
      price: 42.99,
      compareAtPrice: 59.99,
      categoryId: skincare.id,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
      ],
      stock: 85,
      isPublished: true,
      isFeatured: true,
      tags: ['vitamin-c', 'brightening', 'serum', 'bestseller'],
    },
    {
      name: 'Hydra Boost Moisturiser',
      description: 'Ultra-light gel moisturiser with ceramides and squalane. Provides 72-hour hydration without clogging pores. Suitable for all skin types.',
      price: 34.50,
      compareAtPrice: null,
      categoryId: skincare.id,
      images: [
        'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=600',
      ],
      stock: 120,
      isPublished: true,
      isFeatured: true,
      tags: ['moisturiser', 'hydrating', 'ceramides'],
    },
    {
      name: 'Gentle Foaming Cleanser',
      description: 'A pH-balanced, sulfate-free foaming cleanser that removes makeup, excess oil, and impurities while maintaining the skin barrier.',
      price: 18.99,
      compareAtPrice: null,
      categoryId: skincare.id,
      images: [
        'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=600',
      ],
      stock: 200,
      isPublished: true,
      isFeatured: false,
      tags: ['cleanser', 'gentle', 'sulfate-free'],
    },
    {
      name: 'Retinol Night Repair Cream',
      description: 'Clinically proven 0.3% retinol formula combined with peptides to visibly reduce fine lines and wrinkles overnight.',
      price: 54.00,
      compareAtPrice: 68.00,
      categoryId: skincare.id,
      images: [
        'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600',
      ],
      stock: 60,
      isPublished: true,
      isFeatured: true,
      tags: ['retinol', 'anti-aging', 'night-cream'],
    },
    // Hair Care
    {
      name: 'Argan Oil Repair Shampoo',
      description: 'Sulfate-free shampoo enriched with pure Moroccan argan oil and keratin proteins. Restores shine, softness, and strength to damaged hair.',
      price: 22.00,
      compareAtPrice: null,
      categoryId: haircare.id,
      images: [
        'https://images.unsplash.com/photo-1637418553553-c6f00c27e41a?w=600',
      ],
      stock: 150,
      isPublished: true,
      isFeatured: true,
      tags: ['shampoo', 'argan-oil', 'repair', 'sulfate-free'],
    },
    {
      name: 'Deep Conditioning Mask',
      description: 'Intensive weekly treatment with shea butter and biotin that transforms dry, brittle hair into silky, manageable locks in just 10 minutes.',
      price: 28.50,
      compareAtPrice: 35.00,
      categoryId: haircare.id,
      images: [
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600',
      ],
      stock: 90,
      isPublished: true,
      isFeatured: false,
      tags: ['hair-mask', 'conditioning', 'shea-butter'],
    },
    {
      name: 'Scalp Revive Serum',
      description: 'Targeted scalp serum with caffeine, zinc, and rosemary extract to stimulate hair follicles and reduce shedding.',
      price: 37.99,
      compareAtPrice: null,
      categoryId: haircare.id,
      images: [
        'https://images.unsplash.com/photo-1519235621655-0b3c4f41ff1e?w=600',
      ],
      stock: 70,
      isPublished: true,
      isFeatured: true,
      tags: ['scalp', 'hair-growth', 'serum'],
    },
    // Makeup
    {
      name: 'Velvet Matte Lipstick',
      description: 'Long-wearing matte formula that glides on smoothly, lasts up to 12 hours, and keeps lips moisturised. Available in 20 shades.',
      price: 16.99,
      compareAtPrice: null,
      categoryId: makeup.id,
      images: [
        'https://images.unsplash.com/photo-1586495777744-4e6232a7eb49?w=600',
      ],
      stock: 300,
      isPublished: true,
      isFeatured: true,
      tags: ['lipstick', 'matte', 'long-wear'],
    },
    {
      name: 'Luminous Foundation SPF 30',
      description: 'Buildable coverage foundation with a natural luminous finish. Infused with SPF 30 and hyaluronic acid. Available in 40 shades.',
      price: 38.00,
      compareAtPrice: 45.00,
      categoryId: makeup.id,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
      ],
      stock: 180,
      isPublished: true,
      isFeatured: true,
      tags: ['foundation', 'spf', 'luminous', 'bestseller'],
    },
    {
      name: 'Precision Brow Pencil',
      description: 'Micro-precision eyebrow pencil with a spoolie brush. Defines, fills, and sculpts brows for a natural, feathery look. Sweat-proof.',
      price: 14.50,
      compareAtPrice: null,
      categoryId: makeup.id,
      images: [
        'https://images.unsplash.com/photo-1583241800698-e8ab01830a22?w=600',
      ],
      stock: 250,
      isPublished: true,
      isFeatured: false,
      tags: ['brows', 'pencil', 'precision'],
    },
    // Fragrances
    {
      name: 'Bloom Eau de Parfum 50ml',
      description: 'A feminine floral fragrance with top notes of jasmine and rose, heart notes of peony, and a warm base of sandalwood and musk. Lasts 8+ hours.',
      price: 65.00,
      compareAtPrice: 80.00,
      categoryId: fragrances.id,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
      ],
      stock: 45,
      isPublished: true,
      isFeatured: true,
      tags: ['perfume', 'floral', 'feminine', 'bestseller'],
    },
    {
      name: 'Noir Intense Eau de Parfum 50ml',
      description: 'A bold, sensual fragrance with notes of oud, amber, cedarwood, and vanilla. Perfect for evening wear.',
      price: 72.00,
      compareAtPrice: null,
      categoryId: fragrances.id,
      images: [
        'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600',
      ],
      stock: 38,
      isPublished: true,
      isFeatured: true,
      tags: ['perfume', 'oud', 'intense', 'unisex'],
    },
    // Body Care
    {
      name: 'Shea Body Butter',
      description: 'Rich, whipped body butter with raw shea butter, cocoa, and sweet almond oil. Melts into skin for 24-hour deep nourishment.',
      price: 24.99,
      compareAtPrice: null,
      categoryId: bodycare.id,
      images: [
        'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
      ],
      stock: 110,
      isPublished: true,
      isFeatured: false,
      tags: ['body-butter', 'shea', 'moisturising'],
    },
    {
      name: 'Coffee Body Scrub',
      description: 'Exfoliating body scrub with fine coffee grounds, coconut oil, and brown sugar. Smooths, tones, and energises the skin.',
      price: 19.99,
      compareAtPrice: 26.00,
      categoryId: bodycare.id,
      images: [
        'https://images.unsplash.com/photo-1591130901921-c9c840c88eb9?w=600',
      ],
      stock: 95,
      isPublished: true,
      isFeatured: true,
      tags: ['scrub', 'exfoliant', 'coffee', 'body'],
    },
    {
      name: 'Rose Glow Body Oil',
      description: 'Lightweight dry body oil with rosehip, jojoba, and vitamin E. Absorbs instantly and leaves skin with a beautiful golden glow.',
      price: 31.00,
      compareAtPrice: null,
      categoryId: bodycare.id,
      images: [
        'https://images.unsplash.com/photo-1600428877878-1a0fd85beda8?w=600',
      ],
      stock: 75,
      isPublished: true,
      isFeatured: true,
      tags: ['body-oil', 'rosehip', 'glow'],
    },
  ];

  let created = 0;
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p as any });
      created++;
    }
  }
  console.log(`✅ ${created} products created (${products.length - created} already existed)`);

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
