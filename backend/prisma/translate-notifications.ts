import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const translations: Record<string, { title: string; body: string }> = {
  '✨ New Arrivals This Week': {
    title: '✨ Novedades de esta semana',
    body: 'Mirá nuestra nueva colección de Remeras — Básica Oversize, Remera Polo y más recién llegadas.',
  },
  '🔥 Flash Sale — 30% Off Fragrances': {
    title: '🔥 Oferta relámpago — 30% de descuento en Jeans',
    body: '¡Solo hoy! Llevate un 30% en todos los Jeans seleccionados. Usá el código FLASH30.',
  },
  '📦 Your Order Has Shipped!': {
    title: '📦 ¡Tu pedido fue enviado!',
    body: 'Excelentes noticias: tu pedido ya está en camino. Llegará en 2 a 3 días hábiles.',
  },
  '💰 Price Drop: Argan Oil Shampoo': {
    title: '💰 Bajó el precio: Jean Skinny Tiro Alto',
    body: 'El Jean Skinny Tiro Alto bajó de $15.000 a $12.500. ¡Aprovechá antes de que vuelva a subir!',
  },
  '🎉 Welcome to Malamia!': {
    title: '🎉 ¡Bienvenido a Malamia!',
    body: 'Gracias por unirte, Horacio. Explorá nuestras colecciones de ropa y acumulá puntos en cada compra.',
  },
  '✅ Order Delivered': {
    title: '✅ Pedido entregado',
    body: 'Tu pedido fue entregado. ¡Esperamos que ames tus productos! Dejá una reseña y ganás puntos extra.',
  },
  '🌿 New Hair Care Collection': {
    title: '🌿 Nueva colección de Polleras',
    body: 'Presentamos nuestra Pollera Midi Flores y Pollera Lápiz Negra. ¡Tu estilo te lo va a agradecer!',
  },
  "🏆 You've Earned Loyalty Points!": {
    title: '🏆 ¡Ganaste puntos de lealtad!',
    body: 'Acabás de sumar puntos con tu última compra. ¡Seguí comprando para desbloquear recompensas exclusivas!',
  },
};

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'horaciotovo@hotmail.com' } });
  if (!user) { console.log('❌ Usuario no encontrado'); return; }

  const userNotifs = await prisma.userNotification.findMany({
    where: { userId: user.id },
    include: { notification: true },
  });

  let updated = 0;
  for (const un of userNotifs) {
    const translation = translations[un.notification.title];
    if (translation) {
      await prisma.notification.update({
        where: { id: un.notification.id },
        data: { title: translation.title, body: translation.body },
      });
      console.log(`  ✅ "${translation.title}"`);
      updated++;
    } else {
      console.log(`  ⏭  Sin traducción para: "${un.notification.title}"`);
    }
  }

  console.log(`\n🔔 ${updated} notificaciones traducidas al español para horaciotovo@hotmail.com`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
