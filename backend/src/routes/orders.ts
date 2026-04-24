import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { awardPointsForOrder } from '../services/loyaltyService';

const router = Router();
const prisma = new PrismaClient();

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

export default router;
