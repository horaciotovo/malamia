import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newPrices: Record<string, { price: number; compareAtPrice: number | null }> = {
  'Remera Básica Oversize':      { price: 8500,  compareAtPrice: 11000 },
  'Remera Estampada Floral':     { price: 9200,  compareAtPrice: null  },
  'Remera Manga Larga Rayada':   { price: 10500, compareAtPrice: 13000 },
  'Remera Crop Sin Mangas':      { price: 8000,  compareAtPrice: null  },
  'Remera Polo Piqué':           { price: 12000, compareAtPrice: 15000 },
  'Pollera Mini Plisada':        { price: 13500, compareAtPrice: 17000 },
  'Pollera Midi Flores':         { price: 14900, compareAtPrice: null  },
  'Pollera Lápiz Negra':         { price: 13000, compareAtPrice: 16500 },
  'Pollera Jean Denim':          { price: 12500, compareAtPrice: null  },
  'Jean Skinny Tiro Alto':       { price: 16000, compareAtPrice: 20000 },
  'Jean Mom Fit Vintage':        { price: 17500, compareAtPrice: null  },
  'Jean Wide Leg Negro':         { price: 18000, compareAtPrice: 20000 },
  'Jean Recto 90s':              { price: 15000, compareAtPrice: null  },
  'Jean Boyfriend Celeste':      { price: 15500, compareAtPrice: 19000 },
};

async function main() {
  let updated = 0;
  for (const [name, prices] of Object.entries(newPrices)) {
    const result = await prisma.product.updateMany({
      where: { name },
      data: {
        price: prices.price,
        compareAtPrice: prices.compareAtPrice,
      },
    });
    if (result.count > 0) {
      console.log(`  ✅ ${name}: $${prices.price}${prices.compareAtPrice ? ` (antes $${prices.compareAtPrice})` : ''}`);
      updated++;
    }
  }
  console.log(`\n💰 ${updated} productos actualizados con precios entre $8.000 y $20.000`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
