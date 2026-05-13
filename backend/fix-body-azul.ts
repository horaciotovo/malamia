import { prisma } from './src/services/prisma';

async function fixBodyAzul() {
  const product = await prisma.product.update({
    where: { id: '992935e7-556d-4c7e-9fd1-5857f8c94114' },
    data: {
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600']
    }
  });
  
  console.log('✅ Fixed Body Azul Marino image');
  console.log('New images:', product.images);
  process.exit(0);
}

fixBodyAzul().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
