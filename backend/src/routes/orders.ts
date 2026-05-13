import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { awardPointsForOrder } from '../services/loyaltyService';
import { prisma } from '../services/prisma';

const router = Router();

router.use(requireAuth);

// POST /api/orders — place order from cart
router.post('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, message: 'Cart is empty.' });
    return;
  }

  // Validate stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      res.status(400).json({
        success: false,
        message: `"${item.product.name}" has insufficient stock.`,
      });
      return;
    }
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  // Create order & decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrement stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  // Award loyalty points (non-blocking)
  awardPointsForOrder(userId, order.id, totalAmount).catch(console.error);

  res.status(201).json({
    success: true,
    data: { ...order, totalAmount: Number(order.totalAmount) },
  });
});

// GET /api/orders/my
router.get('/my', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user!.id },
      skip,
      take: limit,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: { userId: req.user!.id } }),
  ]);

  res.json({
    success: true,
    data: {
      data: orders.map((o) => ({ ...o, totalAmount: Number(o.totalAmount) })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/orders/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== req.user!.id) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  res.json({
    success: true,
    data: { ...order, totalAmount: Number(order.totalAmount) },
  });
});

// PUT /api/orders/:id — update order items
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user!.id;
  const { items } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== userId) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  if (order.status && order.status.toUpperCase() !== 'PENDING') {
    res.status(400).json({ success: false, message: 'Cannot edit non-pending orders.' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: 'Items cannot be empty.' });
    return;
  }

  // Validate stock for updated items
  const oldItems = order.items;
  for (const newItem of items) {
    const oldItem = oldItems.find((i) => i.productId === newItem.productId);
    const quantityDiff = newItem.quantity - (oldItem?.quantity || 0);
    if (quantityDiff > 0 && newItem.product.stock < quantityDiff) {
      res.status(400).json({
        success: false,
        message: `"${newItem.product.name}" has insufficient stock for the requested quantity.`,
      });
      return;
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Restore stock for old items
    for (const oldItem of oldItems) {
      await tx.product.update({
        where: { id: oldItem.productId },
        data: { stock: { increment: oldItem.quantity } },
      });
    }

    // Delete old items
    await tx.orderItem.deleteMany({ where: { orderId } });

    // Calculate new total
    const newTotalAmount = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0,
    );

    // Create new items
    const result = await tx.order.update({
      where: { id: orderId },
      data: {
        totalAmount: newTotalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrement stock for new items
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return result;
  });

  res.json({
    success: true,
    data: { ...updatedOrder, totalAmount: Number(updatedOrder.totalAmount) },
  });
});

// DELETE /api/orders/:id — delete order
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user!.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== userId) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  if (order.status && order.status.toUpperCase() !== 'PENDING') {
    res.status(400).json({ success: false, message: 'Cannot delete non-pending orders.' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Restore stock for all items
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Delete order items
    await tx.orderItem.deleteMany({ where: { orderId } });

    // Delete order
    await tx.order.delete({ where: { id: orderId } });
  });

  res.json({ success: true, message: 'Order deleted successfully.' });
});

export default router;
