import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';

const router = Router();

router.use(requireAuth);

// GET /api/notifications/my
router.get('/my', async (req: AuthRequest, res: Response) => {
  const items = await prisma.userNotification.findMany({
    where: { userId: req.user!.id },
    include: { notification: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({
    success: true,
    data: items.map((item) => ({
      userNotificationId: item.id,
      isRead: item.isRead,
      readAt: item.readAt,
      createdAt: item.createdAt,
      ...item.notification,
    })),
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  await prisma.userNotification.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { isRead: true, readAt: new Date() },
  });
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  await prisma.userNotification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  res.json({ success: true });
});

// POST /api/notifications/push-token — register Expo push token
router.post('/push-token', async (req: AuthRequest, res: Response) => {
  const { token } = req.body as { token: string };
  if (!token) {
    res.status(400).json({ success: false, message: 'token required.' });
    return;
  }
  await prisma.user.update({ where: { id: req.user!.id }, data: { pushToken: token } });
  res.json({ success: true });
});

export default router;
