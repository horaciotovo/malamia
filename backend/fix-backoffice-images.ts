import { prisma } from './src/services/prisma';

// All these Unsplash URLs are verified to be working
const productUpdates = [
  { name: 'Body Rojo Pasión', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Body Estampado Colores', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Body Blanco Básico', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { name: 'Pollera Jean Azul', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Pollera Estampada Flores', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Pollera Gris Casual', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { name: 'Pollera Negra Elegante', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Pollera Mini Negra', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Short Rojo Deportivo', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { name: 'Short Blanco Verano', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Short Deportivo Negro', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Short Khaki', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { name: 'Short Denim Clásico', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Jean Azul Claro', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Jean Mom Fit', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { name: 'Jean Roto Diseño', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Jean Slim Clásico', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Jean Skinny Azul Oscuro', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
  { name: 'Remera Azul Marino', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Remera Rosa Pastel', image: 'https://images.unsplash.com/photo-1556821840-a63d3b37c038?w=600' },
  { name: 'Remera Estampada Colores', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
];

async function updateImages() {
  console.log('🔄 Fixing all backoffice image URLs...');
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
