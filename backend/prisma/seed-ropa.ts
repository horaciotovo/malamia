import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando datos existentes...');

  // Delete in dependency order
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('  ✅ Productos y categorías eliminados');

  // ── Categorías ───────────────────────────────────────────────────────────────
  const [remeras, polleras, jeans] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Remeras',
        slug: 'remeras',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Polleras',
        slug: 'polleras',
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jeans',
        slug: 'jeans',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        sortOrder: 3,
      },
    }),
  ]);
  console.log('  ✅ 3 categorías creadas: Remeras, Polleras, Jeans');

  // ── Productos ────────────────────────────────────────────────────────────────
  const products = [
    // ── Remeras ──
    {
      name: 'Remera Básica Oversize',
      description: 'Remera oversize de algodón 100% peinado. Corte relajado, cuello redondo y largo extra. Ideal para usar sola o como capa. Disponible en varios colores.',
      price: 4500,
      compareAtPrice: 6000,
      categoryId: remeras.id,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600',
      ],
      stock: 120,
      isPublished: true,
      isFeatured: true,
      tags: ['remera', 'oversize', 'básica', 'algodón'],
    },
    {
      name: 'Remera Estampada Floral',
      description: 'Remera con estampado floral exclusivo, tela liviana y suave al tacto. Perfecta para el verano. Corte regular con cuello redondo.',
      price: 5200,
      compareAtPrice: null,
      categoryId: remeras.id,
      images: [
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
      ],
      stock: 80,
      isPublished: true,
      isFeatured: true,
      tags: ['remera', 'floral', 'estampada', 'verano'],
    },
    {
      name: 'Remera Manga Larga Rayada',
      description: 'Remera manga larga con rayas horizontales clásicas. Tela de algodón elastizado para mayor comodidad. Para el entretiempo o capas en invierno.',
      price: 5800,
      compareAtPrice: 7200,
      categoryId: remeras.id,
      images: [
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
      ],
      stock: 60,
      isPublished: true,
      isFeatured: false,
      tags: ['remera', 'manga larga', 'rayada', 'entretiempo'],
    },
    {
      name: 'Remera Crop Sin Mangas',
      description: 'Remera sin mangas estilo crop top. Tela interlock suave con costuras planas. Perfecta para combinar con jeans de tiro alto o polleras.',
      price: 3900,
      compareAtPrice: null,
      categoryId: remeras.id,
      images: [
        'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600',
      ],
      stock: 95,
      isPublished: true,
      isFeatured: false,
      tags: ['remera', 'crop', 'sin mangas', 'verano'],
    },
    {
      name: 'Remera Polo Piqué',
      description: 'Remera estilo polo en tela piqué de alta calidad. Cuello con botones, mangas cortas con puño. Clásico y versátil para cualquier ocasión.',
      price: 6500,
      compareAtPrice: 8000,
      categoryId: remeras.id,
      images: [
        'https://images.unsplash.com/photo-1625910513312-27a4be81a03a?w=600',
      ],
      stock: 70,
      isPublished: true,
      isFeatured: true,
      tags: ['remera', 'polo', 'piqué', 'clásica'],
    },

    // ── Polleras ──
    {
      name: 'Pollera Mini Plisada',
      description: 'Pollera mini plisada con elástico en la cintura. Tela liviana satinada con caída perfecta. Ideal para combinar con remeras básicas o blusa.',
      price: 7200,
      compareAtPrice: 9500,
      categoryId: polleras.id,
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600',
        'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=600',
      ],
      stock: 55,
      isPublished: true,
      isFeatured: true,
      tags: ['pollera', 'mini', 'plisada', 'satinada'],
    },
    {
      name: 'Pollera Midi Flores',
      description: 'Pollera midi con estampado de flores grandes. Tela crepe fluida, cintura elástica y largo que llega a la rodilla. Romántica y femenina.',
      price: 8900,
      compareAtPrice: null,
      categoryId: polleras.id,
      images: [
        'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600',
      ],
      stock: 40,
      isPublished: true,
      isFeatured: true,
      tags: ['pollera', 'midi', 'flores', 'crepe'],
    },
    {
      name: 'Pollera Lápiz Negra',
      description: 'Pollera lápiz clásica en color negro. Tela bengalina con elasticidad para mayor confort. Largo rodilla, cierre lateral. Ideal para el trabajo o una salida.',
      price: 7800,
      compareAtPrice: 9200,
      categoryId: polleras.id,
      images: [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600',
      ],
      stock: 65,
      isPublished: true,
      isFeatured: false,
      tags: ['pollera', 'lápiz', 'negra', 'bengalina'],
    },
    {
      name: 'Pollera Jean Denim',
      description: 'Pollera en tela denim, estilo falda mini con botones adelante. El clásico de los años 90 que volvió con todo. Combina con cualquier look.',
      price: 8500,
      compareAtPrice: null,
      categoryId: polleras.id,
      images: [
        'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600',
      ],
      stock: 50,
      isPublished: true,
      isFeatured: false,
      tags: ['pollera', 'denim', 'jean', 'mini'],
    },

    // ── Jeans ──
    {
      name: 'Jean Skinny Tiro Alto',
      description: 'Jean skinny de tiro alto con 2% elastano para máxima comodidad. Cintura bien marcada y pierna ajustada. El infaltable del guardarropa femenino.',
      price: 12500,
      compareAtPrice: 15000,
      categoryId: jeans.id,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
        'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600',
      ],
      stock: 100,
      isPublished: true,
      isFeatured: true,
      tags: ['jean', 'skinny', 'tiro alto', 'elastano'],
    },
    {
      name: 'Jean Mom Fit Vintage',
      description: 'Jean estilo mom con lavado vintage desgastado. Corte relajado en la cadera y tiro alto. La tendencia retro que no para de crecer.',
      price: 13800,
      compareAtPrice: null,
      categoryId: jeans.id,
      images: [
        'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600',
      ],
      stock: 75,
      isPublished: true,
      isFeatured: true,
      tags: ['jean', 'mom', 'vintage', 'tiro alto'],
    },
    {
      name: 'Jean Wide Leg Negro',
      description: 'Jean de pierna ancha en color negro liso. Tiro medio, corte holgado desde la cadera. Moderno y cómodo, perfecto para looks urbanos.',
      price: 14200,
      compareAtPrice: 17000,
      categoryId: jeans.id,
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
      ],
      stock: 60,
      isPublished: true,
      isFeatured: true,
      tags: ['jean', 'wide leg', 'negro', 'urbano'],
    },
    {
      name: 'Jean Recto 90s',
      description: 'Jean de corte recto inspirado en los años 90. Talle medio, pierna recta y largo tobillo. Con pequeños detalles de desgaste en rodillas.',
      price: 11900,
      compareAtPrice: null,
      categoryId: jeans.id,
      images: [
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600',
      ],
      stock: 85,
      isPublished: true,
      isFeatured: false,
      tags: ['jean', 'recto', '90s', 'desgastado'],
    },
    {
      name: 'Jean Boyfriend Celeste',
      description: 'Jean boyfriend de color celeste medio, efecto lavado suave. Extra cómodo con corte holgado. Ideal para el día a día con zapatillas o tacos.',
      price: 12000,
      compareAtPrice: 14500,
      categoryId: jeans.id,
      images: [
        'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600',
      ],
      stock: 55,
      isPublished: true,
      isFeatured: false,
      tags: ['jean', 'boyfriend', 'celeste', 'cómodo'],
    },
  ];

  let count = 0;
  for (const p of products) {
    await prisma.product.create({ data: p as any });
    count++;
  }
  console.log(`  ✅ ${count} productos creados`);
  console.log(`  📌 Destacados: ${products.filter(p => p.isFeatured).length}`);
  console.log('\n🎉 ¡Listo! Categorías y productos actualizados.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
