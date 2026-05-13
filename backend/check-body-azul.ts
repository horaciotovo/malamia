import { prisma } from './src/services/prisma';

async function checkProduct() {
  const product = await prisma.product.findFirst({
    where: { name: 'Body Azul Marino' }
  });
  
  if (product) {
    console.log('\n📦 Body Azul Marino Product:');
    console.log('  ID:', product.id);
    console.log('  Images:', JSON.stringify(product.images, null, 2));
  } else {
    console.log('❌ Product not found');
  }
  
  process.exit(0);
}

checkProduct().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
