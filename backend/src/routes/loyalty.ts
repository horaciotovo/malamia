import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';

const router = Router();

// GET /api/loyalty/my-points
router.get('/my-points', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await prisma.loyaltyTransaction.aggregate({
    where: { userId: req.user!.id },
    _sum: { points: true },
  });
  const total = result._sum.points ?? 0;
  res.json({ success: true, data: { totalPoints: total } });
});

// GET /api/loyalty/transactions
router.get('/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: transactions });
});

// GET /api/loyalty/leaderboard
router.get('/leaderboard', requireAuth, async (_req: AuthRequest, res: Response) => {
  const results = await prisma.loyaltyTransaction.groupBy({
    by: ['userId'],
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 50,
  });

  const userIds = results.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, avatar: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const leaderboard = results
    .map((r, index) => {
      const user = userMap.get(r.userId);
      if (!user) return null;
      return {
        rank: index + 1,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        totalPoints: r._sum.points ?? 0,
      };
    })
    .filter(Boolean);

  res.json({ success: true, data: leaderboard });
});

export default router;
