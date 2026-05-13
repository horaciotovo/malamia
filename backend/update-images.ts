import { prisma } from './src/services/prisma';

const productUpdates = [
  { name: 'Remera Gris Oversize', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Remera Verde Menta', image: 'https://images.unsplash.com/photo-1600428877878-1a0fd85beda8?w=600' },
  { name: 'Jean Skinny Azul Oscuro', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600' },
  { name: 'Jean Slim Clásico', image: 'https://images.unsplash.com/photo-1514886286974-6c03bf463b2f?w=600' },
  { name: 'Jean Azul Claro', image: 'https://images.unsplash.com/photo-1519156677039-dbf319e37221?w=600' },
  { name: 'Short Khaki', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600' },
  { name: 'Short Blanco Verano', image: 'https://images.unsplash.com/photo-1473081169829-3e50ee752eed?w=600' },
  { name: 'Pollera Gris Casual', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { name: 'Pollera Estampada Flores', image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=600' },
  { name: 'Pollera Mini Negra', image: 'https://images.unsplash.com/photo-1560807707-6cc04b73a39d?w=600' },
  { name: 'Body Blanco Básico', image: 'https://images.unsplash.com/photo-1488161628813-04466f592e48?w=600' },
  { name: 'Body Estampado Colores', image: 'https://images.unsplash.com/photo-1506150613881-a3f6228a6c1d?w=600' },
  { name: 'Body Rojo Pasión', image: 'https://images.unsplash.com/photo-1520006348518-bc99f7265051?w=600' },
];

async function updateImages() {
  console.log('🔄 Updating product images...');
  
  for (const update of productUpdates) {
    const product = await prisma.product.findFirst({
      where: { name: update.name },
    });
    
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: [update.image] },
      });
      console.log(`✅ Updated: ${update.name}`);
    } else {
      console.log(`⚠️  Not found: ${update.name}`);
    }
  }
  
  console.log('🎉 All images updated!');
  process.exit(0);
}

updateImages().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
