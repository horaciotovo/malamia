import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin, AuthRequest } from '../middleware/auth';
import { upload, uploadToCloudinary } from '../middleware/upload';
import { sendPushNotificationToAll, sendPushNotificationToUsers } from '../services/notificationService';

const router = Router();
const prisma = new PrismaClient();

// All admin routes require ADMIN role
router.use(requireAdmin);

// ─── Dashboard ───────────────────────────────────────────────────────────────

router.get('/dashboard', async (_req: Request, res: Response) => {
  const [totalProducts, publishedProducts, totalCustomers, orderAgg, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, _count: { id: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

  res.json({
    success: true,
    data: {
      totalProducts,
      publishedProducts,
      totalCustomers,
      totalOrders: orderAgg._count.id,
      totalRevenue: Number(orderAgg._sum.totalAmount ?? 0),
      recentOrders: recentOrders.map((o) => ({ ...o, totalAmount: Number(o.totalAmount) })),
    },
  });
});

// ─── Products ────────────────────────────────────────────────────────────────

router.get('/products', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;

  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }] }
    : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, include: { category: true }, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      data: data.map((p) => ({ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null })),
      total, page, limit, totalPages: Math.ceil(total / limit),
    },
  });
});

router.get('/products/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: { category: true } });
  if (!product) { res.status(404).json({ success: false, message: 'Product not found.' }); return; }
  res.json({ success: true, data: { ...product, price: Number(product.price) } });
});

router.post('/products', upload.array('images', 8), async (req: AuthRequest, res: Response) => {
  const { name, description, price, compareAtPrice, categoryId, stock, isFeatured, isPublished, tags } = req.body as {
    name: string; description: string; price: string; compareAtPrice?: string;
    categoryId: string; stock: string; isFeatured?: string; isPublished?: string; tags?: string;
  };

  const files = req.files as Express.Multer.File[];
  const imageUrls: string[] = [];
  for (const file of files) {
    const { url } = await uploadToCloudinary(file.buffer, 'malamia/products');
    imageUrls.push(url);
  }

  const prevPrice = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
  const product = await prisma.product.create({
    data: {
      name, description, price: parseFloat(price),
      compareAtPrice: prevPrice, categoryId,
      stock: parseInt(stock), isFeatured: isFeatured === 'true',
      isPublished: isPublished === 'true',
      images: imageUrls,
      tags: tags ? JSON.parse(tags) : [],
    },
    include: { category: true },
  });

  // Send push notification if published
  if (product.isPublished) {
    sendPushNotificationToAll({
      title: '✨ New Arrival!',
      body: `${product.name} is now available.`,
      type: 'NEW_PRODUCT',
      data: { productId: product.id },
      createdBy: req.user!.id,
    }).catch(console.error);
  }

  res.status(201).json({ success: true, data: { ...product, price: Number(product.price) } });
});

router.put('/products/:id', upload.array('images', 8), async (req: AuthRequest, res: Response) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ success: false, message: 'Product not found.' }); return; }

  const { name, description, price, compareAtPrice, categoryId, stock, isFeatured, isPublished, tags, existingImages } =
    req.body as Record<string, string>;

  const files = req.files as Express.Multer.File[];
  const newImageUrls: string[] = [];
  for (const file of files) {
    const { url } = await uploadToCloudinary(file.buffer, 'malamia/products');
    newImageUrls.push(url);
  }

  const keptImages: string[] = existingImages ? JSON.parse(existingImages) : [];
  const images = [...keptImages, ...newImageUrls];

  const newPrice = price ? parseFloat(price) : Number(existing.price);
  const priceChanged = newPrice !== Number(existing.price);

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      name, description, price: newPrice,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      categoryId, stock: stock ? parseInt(stock) : undefined,
      isFeatured: isFeatured === 'true',
      isPublished: isPublished === 'true',
      images,
      tags: tags ? JSON.parse(tags) : existing.tags,
    },
  });

  // Notify on price change
  if (priceChanged && updated.isPublished) {
    sendPushNotificationToAll({
      title: '🏷️ Price Update',
      body: `${updated.name} is now $${newPrice.toFixed(2)}.`,
      type: 'PRICE_CHANGE',
      data: { productId: updated.id },
      createdBy: req.user!.id,
    }).catch(console.error);
  }

  res.json({ success: true, data: { ...updated, price: Number(updated.price) } });
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Product deleted.' });
});

router.patch('/products/:id/publish', async (req: Request, res: Response) => {
  const { isPublished } = req.body as { isPublished: boolean };
  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { isPublished },
  });
  res.json({ success: true, data: { ...updated, price: Number(updated.price) } });
});

// ─── Categories ──────────────────────────────────────────────────────────────

router.get('/categories', async (_req: Request, res: Response) => {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ success: true, data: cats });
});

router.post('/categories', async (req: Request, res: Response) => {
  const { name, slug } = req.body as { name: string; slug: string };
  const cat = await prisma.category.create({ data: { name, slug } });
  res.status(201).json({ success: true, data: cat });
});

router.delete('/categories/:id', async (req: Request, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ─── Users ───────────────────────────────────────────────────────────────────

router.get('/users', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;

  const where = {
    role: 'CUSTOMER' as const,
    ...(search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  // Get loyalty points per user
  const pointsData = await prisma.loyaltyTransaction.groupBy({
    by: ['userId'],
    _sum: { points: true },
    where: { userId: { in: users.map((u) => u.id) } },
  });
  const pointsMap = new Map(pointsData.map((p) => [p.userId, p._sum.points ?? 0]));

  res.json({
    success: true,
    data: {
      data: users.map((u) => ({ ...u, loyaltyPoints: pointsMap.get(u.id) ?? 0 })),
      total, page, limit, totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── Notifications ───────────────────────────────────────────────────────────

router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ skip, take: limit, orderBy: { sentAt: 'desc' } }),
      prisma.notification.count(),
    ]);
    res.json({ success: true, data: { data, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications. Database error.' });
  }
});

router.post('/notifications/send', async (req: AuthRequest, res: Response) => {
  const { title, body, type, imageUrl, data: notifData, targetAll, targetUserIds } =
    req.body as {
      title: string; body: string; type: string; imageUrl?: string;
      data?: Record<string, unknown>; targetAll: boolean; targetUserIds?: string[];
    };

  if (targetAll) {
    await sendPushNotificationToAll({ title, body, type: type as never, imageUrl, data: notifData, createdBy: req.user!.id });
  } else if (targetUserIds?.length) {
    await sendPushNotificationToUsers(targetUserIds, { title, body, type: type as never, imageUrl, data: notifData, createdBy: req.user!.id });
  }

  res.json({ success: true, message: 'Notifications sent.' });
});

// ─── Admin Management ────────────────────────────────────────────────────────

// GET /api/admin/all-users — get all users (customers + admins) with role
router.get('/all-users', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  // Get loyalty points per user
  const pointsData = await prisma.loyaltyTransaction.groupBy({
    by: ['userId'],
    _sum: { points: true },
    where: { userId: { in: users.map((u) => u.id) } },
  });
  const pointsMap = new Map(pointsData.map((p) => [p.userId, p._sum.points ?? 0]));

  res.json({
    success: true,
    data: {
      data: users.map((u) => ({ ...u, loyaltyPoints: pointsMap.get(u.id) ?? 0 })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// PATCH /api/admin/users/:id/role — change user role (CUSTOMER ↔ ADMIN)
router.patch('/users/:id/role', async (req: AuthRequest, res: Response) => {
  const { role } = req.body as { role: 'CUSTOMER' | 'ADMIN' };
  if (!['CUSTOMER', 'ADMIN'].includes(role)) {
    res.status(400).json({ success: false, message: 'Invalid role.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });

  res.json({
    success: true,
    message: `User promoted to ${role === 'ADMIN' ? 'Admin' : 'Customer'}.`,
    data: updated,
  });
});

// PATCH /api/admin/users/:id/toggle — toggle user active status
router.patch('/users/:id/toggle', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });

  res.json({
    success: true,
    message: `User ${updated.isActive ? 'activated' : 'deactivated'}.`,
    data: updated,
  });
});

// GET /api/admin/orders — get all orders (paginated)
router.get('/orders', async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count(),
  ]);

  const formattedOrders = orders.map((order) => ({
    ...order,
    total: Number(order.totalAmount),
  }));

  res.json({
    success: true,
    data: {
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export default router;
