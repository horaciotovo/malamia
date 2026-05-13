import { prisma } from './src/services/prisma';

const productUpdates = [
  { name: 'Body Azul Marino', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Jean Roto Diseño', image: 'https://images.unsplash.com/photo-1548883329-ee3695a91529?w=600' },
  { name: 'Jean Mom Fit', image: 'https://images.unsplash.com/photo-1519156677039-dbf319e37221?w=600' },
  { name: 'Short Deportivo Negro', image: 'https://images.unsplash.com/photo-1574701148212-403bdad855b7?w=600' },
  { name: 'Short Rojo Deportivo', image: 'https://images.unsplash.com/photo-1622551693241-abc0ded2f5d0?w=600' },
  { name: 'Remera Azul Marino', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Remera Rosa Pastel', image: 'https://images.unsplash.com/photo-1576566588286-c1fe8e1e5d6d?w=600' },
];

async function updateImages() {
  console.log('🔄 Fixing remaining product images...');
  let updated = 0;
  let notFound = 0;
  
  for (const update of productUpdates) {
    const product = await prisma.product.findFirst({
      where: { name: update.name },
    });
    
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: [update.image] },
      });
      console.log(`✅ Fixed: ${update.name}`);
      updated++;
    } else {
      console.log(`⚠️  Not found: ${update.name}`);
      notFound++;
    }
  }
  
  console.log(`🎉 Fixed ${updated} products! (${notFound} not found)`);
  process.exit(0);
}

updateImages().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
