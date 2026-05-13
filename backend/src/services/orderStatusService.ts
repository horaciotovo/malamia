import { prisma } from './prisma';
import { sendPushNotificationToUsers } from './notificationService';

/**
 * Check for orders created 48 hours ago that haven't changed status
 * and send a "Waiting for pickup" notification
 */
export async function checkOrdersWaitingForPickup(): Promise<void> {
  try {
    // Calculate 48 hours ago
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find orders created 48 hours ago that are still in PENDING status
    // and haven't had a pickup reminder sent yet
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lte: fortyEightHoursAgo,
        },
        pickupReminderSentAt: null,  // Only send if not already sent
      },
      include: {
        user: true,
      },
    });

    if (pendingOrders.length === 0) {
      console.log('[OrderStatus] No pending orders waiting for pickup.');
      return;
    }

    console.log(
      `[OrderStatus] Found ${pendingOrders.length} order(s) waiting for pickup.`,
    );

    // Send notification to each user and mark as sent
    for (const order of pendingOrders) {
      const orderShortId = order.id.substring(0, 8).toUpperCase();
      const notificationPayload = {
        title: '📦 Recogido en tienda',
        body: `Tu pedido #${orderShortId} está esperando ser recogido. Si no lo recoges dentro de 24hs, el pedido se cancelará automáticamente.`,
        type: 'ORDER_UPDATE' as const,
        data: {
          orderId: order.id,
          actionType: 'PICKUP_WAITING',
        },
        createdBy: 'system', // System-generated notification
      };

      // Send notification and update order
      await Promise.all([
        sendPushNotificationToUsers([order.userId], notificationPayload),
        prisma.order.update({
          where: { id: order.id },
          data: { pickupReminderSentAt: new Date() },
        }),
      ]);

      console.log(
        `[OrderStatus] Sent pickup notification for order ${order.id} to user ${order.userId}`,
      );
    }
  } catch (error) {
    console.error('[OrderStatus] Error checking order status:', error);
  }
}

/**
 * Check for orders that are older than 72 hours (48 + 24) in PENDING status
 * and automatically cancel them
 */
export async function autoCancelExpiredOrders(): Promise<void> {
  try {
    // Calculate 72 hours ago (48 hours initial wait + 24 hours grace period)
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

    // Find orders older than 72 hours that are still in PENDING status
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lte: seventyTwoHoursAgo,
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (expiredOrders.length === 0) {
      console.log('[OrderStatus] No expired orders to cancel.');
      return;
    }

    console.log(
      `[OrderStatus] Found ${expiredOrders.length} expired order(s) to cancel.`,
    );

    // Cancel each order and restore stock
    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        // Mark order as EXPIRED
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'EXPIRED' },
        });

        // Restore stock for each item
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });

      // Send expiration notification
      const orderShortId = order.id.substring(0, 8).toUpperCase();
      const notificationPayload = {
        title: '⏱️ Pedido Expirado',
        body: `Tu pedido #${orderShortId} ha expirado automáticamente por no ser recogido en el plazo establecido. Los productos han sido devueltos al inventario.`,
        type: 'ORDER_UPDATE' as const,
        data: {
          orderId: order.id,
          actionType: 'ORDER_EXPIRED',
        },
        createdBy: 'system',
      };

      await sendPushNotificationToUsers([order.userId], notificationPayload);
      console.log(
        `[OrderStatus] Expired order ${order.id} and notified user ${order.userId}`,
      );
    }
  } catch (error) {
    console.error('[OrderStatus] Error auto-cancelling orders:', error);
  }
}

/**
 * Start scheduled tasks for order status management
 */
export function startOrderStatusScheduler(): void {
  console.log('[OrderStatus] Starting order status scheduler...');

  // Check for orders waiting for pickup every 6 hours
  const pickupCheckInterval = setInterval(checkOrdersWaitingForPickup, 6 * 60 * 60 * 1000);

  // Check for expired orders every 12 hours
  const expiredCheckInterval = setInterval(autoCancelExpiredOrders, 12 * 60 * 60 * 1000);

  // Run checks immediately on startup
  checkOrdersWaitingForPickup().catch(console.error);
  autoCancelExpiredOrders().catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    clearInterval(pickupCheckInterval);
    clearInterval(expiredCheckInterval);
    console.log('[OrderStatus] Order status scheduler stopped.');
  });
}
