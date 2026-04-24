import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'htovo@test.com' },
    include: { cart: true },
  });

  if (!user) {
    console.log('❌ User htovo@test.com not found');
    return;
  }

  // Ensure cart exists
  let cart = user.cart;
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  // Pick a few products to add
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    take: 3,
    orderBy: { isFeatured: 'desc' },
  });

  for (const product of products) {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: product.id },
    });
    if (!existing) {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: product.id, quantity: 1 },
      });
      console.log(`  ✅ Added "${product.name}" to cart`);
    } else {
      console.log(`  ⏭  "${product.name}" already in cart`);
    }
  }

  console.log('🛒 Cart seeded for htovo@test.com!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
