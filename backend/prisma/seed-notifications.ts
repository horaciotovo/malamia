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
      title: '✨ Novedades de esta semana',
      body: 'Mirá nuestra nueva colección de Remeras — Básica Oversize, Remera Polo y más recién llegadas!',
      type: 'NEW_PRODUCT',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      data: { screen: 'Catalog', categorySlug: 'remeras' },
      daysAgo: 1,
      isRead: false,
    },
    {
      title: '🔥 Oferta relámpago — 30% de descuento en Jeans',
      body: '¡Solo hoy! Llevate un 30% en todos los Jeans seleccionados. Usá el código FLASH30.',
      type: 'PROMOTION',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
      data: { screen: 'Catalog', categorySlug: 'jeans', promoCode: 'FLASH30' },
      daysAgo: 2,
      isRead: false,
    },
    {
      title: '📦 ¡Tu pedido fue enviado!',
      body: 'Excelentes noticias — tu pedido ya está en camino. Llegará en 2–3 días hábiles.',
      type: 'ORDER_UPDATE',
      data: { status: 'SHIPPED' },
      daysAgo: 5,
      isRead: false,
    },
    {
      title: '💰 Bajó el precio: Jean Skinny Tiro Alto',
      body: 'El Jean Skinny Tiro Alto bajó de $15.000 a $12.500. ¡Aprovechá antes de que vuelva a subir!',
      type: 'PRICE_CHANGE',
      imageUrl: 'https://images.unsplash.com/photo-1637418553553-c6f00c27e41a?w=400',
      data: { screen: 'ProductDetail' },
      daysAgo: 7,
      isRead: true,
    },
    {
      title: '🎉 ¡Bienvenido a Malamia!',
      body: 'Gracias por unirte, Horacio! Explorá nuestras colecciones de ropa y acumulá puntos en cada compra.',
      type: 'PROMOTION',
      daysAgo: 10,
      isRead: true,
    },
    {
      title: '✅ Pedido entregado',
      body: 'Tu pedido fue entregado. ¡Esperamos que ames tus productos! Dejá una reseña y ganás puntos extra.',
      type: 'ORDER_UPDATE',
      data: { status: 'DELIVERED' },
      daysAgo: 15,
      isRead: true,
    },
    {
      title: '🌿 Nueva colección de Polleras',
      body: 'Presentamos nuestra Pollera Midi Flores y Pollera Lápiz Negra — tu estilo te lo va a agradecer.',
      type: 'NEW_PRODUCT',
      imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
      data: { screen: 'Catalog', categorySlug: 'polleras' },
      daysAgo: 20,
      isRead: true,
    },
    {
      title: '🏆 ¡Ganaste puntos de lealtad!',
      body: 'Acabás de sumar puntos con tu última compra. ¡Seguí comprando para desbloquear recompensas exclusivas!',
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
