import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'horaciotovo@hotmail.com' } });
  if (!user) { console.log('❌ User not found'); return; }

  // Use the user themselves as "admin" createdBy for seed purposes
  const adminId = user.id;

  const notifications: Array<{
    title: string;
    body: string;
    type: NotificationType;
    imageUrl?: string;
    data?: object;
    daysAgo: number;
    isRead: boolean;
  }> = [
    {
      title: '✨ New Arrivals This Week',
      body: 'Check out our latest Skincare collection — Radiance Serum, Retinol Repair Cream and more just landed!',
      type: 'NEW_PRODUCT',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      data: { screen: 'Catalog', categorySlug: 'skincare' },
      daysAgo: 1,
      isRead: false,
    },
    {
      title: '🔥 Flash Sale — 30% Off Fragrances',
      body: 'Today only! Get 30% off all fragrances including Bloom EDP and Noir Intense. Use code FLASH30.',
      type: 'PROMOTION',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
      data: { screen: 'Catalog', categorySlug: 'fragrances', promoCode: 'FLASH30' },
      daysAgo: 2,
      isRead: false,
    },
    {
      title: '📦 Your Order Has Shipped!',
      body: 'Great news — your order is on its way. Expected delivery in 2–3 business days.',
      type: 'ORDER_UPDATE',
      data: { status: 'SHIPPED' },
      daysAgo: 5,
      isRead: false,
    },
    {
      title: '💰 Price Drop: Argan Oil Shampoo',
      body: 'Argan Oil Repair Shampoo dropped from $28 to $22. Grab it before it goes back up!',
      type: 'PRICE_CHANGE',
      imageUrl: 'https://images.unsplash.com/photo-1637418553553-c6f00c27e41a?w=400',
      data: { screen: 'ProductDetail' },
      daysAgo: 7,
      isRead: true,
    },
    {
      title: '🎉 Welcome to Malamia!',
      body: 'Thanks for joining us, Horacio! Explore our curated beauty collections and earn loyalty points on every order.',
      type: 'PROMOTION',
      daysAgo: 10,
      isRead: true,
    },
    {
      title: '✅ Order Delivered',
      body: 'Your order has been delivered. We hope you love your products! Leave a review and earn bonus points.',
      type: 'ORDER_UPDATE',
      data: { status: 'DELIVERED' },
      daysAgo: 15,
      isRead: true,
    },
    {
      title: '🌿 New Hair Care Collection',
      body: 'Introducing our Deep Conditioning Mask and Scalp Revive Serum — your hair will thank you.',
      type: 'NEW_PRODUCT',
      imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
      data: { screen: 'Catalog', categorySlug: 'haircare' },
      daysAgo: 20,
      isRead: true,
    },
    {
      title: '🏆 You\'ve Earned Loyalty Points!',
      body: 'You just earned points from your last purchase. Keep shopping to unlock exclusive rewards!',
      type: 'PROMOTION',
      daysAgo: 30,
      isRead: true,
    },
  ];

  let created = 0;
  for (const n of notifications) {
    const sentAt = new Date();
    sentAt.setDate(sentAt.getDate() - n.daysAgo);

    const notification = await prisma.notification.create({
      data: {
        title: n.title,
        body: n.body,
        type: n.type,
        imageUrl: n.imageUrl,
        data: n.data ?? {},
        sentAt,
        createdBy: adminId,
      },
    });

    const readAt = n.isRead ? new Date(sentAt.getTime() + 60 * 60 * 1000) : null;

    await prisma.userNotification.create({
      data: {
        userId: user.id,
        notificationId: notification.id,
        isRead: n.isRead,
        readAt,
        createdAt: sentAt,
      },
    });

    console.log(`  ✅ [${n.isRead ? 'READ  ' : 'UNREAD'}] ${n.title}`);
    created++;
  }

  console.log(`\n🔔 ${created} notifications created for horaciotovo@hotmail.com`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
