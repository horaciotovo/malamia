import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All cart routes require auth
router.use(requireAuth);

// GET /api/cart
router.get('/', async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.id },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  res.json({ success: true, data: cart ?? { items: [] } });
});

// POST /api/cart/items
router.post('/items', async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body as { productId: string; quantity?: number };
  if (!productId) {
    res.status(400).json({ success: false, message: 'productId required.' });
    return;
  }

  // Ensure user has a cart
  let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.user!.id } });
  }

  // Upsert cart item
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  res.json({ success: true, data: updated });
});

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body as { quantity: number };
  if (!quantity || quantity < 1) {
    res.status(400).json({ success: false, message: 'Valid quantity required.' });
    return;
  }

  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (!item || !cart || item.cartId !== cart.id) {
    res.status(404).json({ success: false, message: 'Cart item not found.' });
    return;
  }

  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  res.json({ success: true, message: 'Cart updated.' });
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || !cart || item.cartId !== cart.id) {
    res.status(404).json({ success: false, message: 'Cart item not found.' });
    return;
  }
  await prisma.cartItem.delete({ where: { id: item.id } });
  res.json({ success: true, message: 'Item removed.' });
});

// DELETE /api/cart — clear entire cart
router.delete('/', async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ success: true, message: 'Cart cleared.' });
});

export default router;
