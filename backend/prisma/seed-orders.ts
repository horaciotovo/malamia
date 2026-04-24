import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'htovo@test.com' } });
  if (!user) { console.log('❌ User not found'); return; }

  const products = await prisma.product.findMany({ where: { isPublished: true }, take: 15 });
  if (products.length === 0) { console.log('❌ No products found, run seed.ts first'); return; }

  const pick = (n: number) => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  const orders: Array<{
    daysAgo: number;
    status: OrderStatus;
    items: Array<{ idx: number; qty: number }>;
  }> = [
    { daysAgo: 2,  status: 'PENDING',   items: [{ idx: 0, qty: 1 }, { idx: 1, qty: 2 }] },
    { daysAgo: 8,  status: 'CONFIRMED', items: [{ idx: 2, qty: 1 }] },
    { daysAgo: 15, status: 'SHIPPED',   items: [{ idx: 3, qty: 1 }, { idx: 4, qty: 1 }, { idx: 5, qty: 3 }] },
    { daysAgo: 30, status: 'DELIVERED', items: [{ idx: 6, qty: 2 }] },
    { daysAgo: 45, status: 'DELIVERED', items: [{ idx: 7, qty: 1 }, { idx: 8, qty: 1 }] },
    { daysAgo: 60, status: 'CANCELLED', items: [{ idx: 9, qty: 1 }] },
    { daysAgo: 75, status: 'DELIVERED', items: [{ idx: 10, qty: 1 }, { idx: 11, qty: 2 }, { idx: 12, qty: 1 }] },
  ];

  let created = 0;
  for (const def of orders) {
    const picked = pick(def.items.length);
    const totalAmount = def.items.reduce((sum, it, i) => {
      const product = picked[i % picked.length];
      return sum + Number(product.price) * it.qty;
    }, 0);

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - def.daysAgo);

    await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: def.status,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: def.items.map((it, i) => {
            const product = picked[i % picked.length];
            return {
              productId: product.id,
              quantity: it.qty,
              price: product.price,
            };
          }),
        },
      },
    });

    console.log(`  ✅ Order [${def.status}] — $${totalAmount.toFixed(2)} — ${def.daysAgo} days ago`);
    created++;
  }

  console.log(`\n🎉 ${created} fake orders created for htovo@test.com`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
