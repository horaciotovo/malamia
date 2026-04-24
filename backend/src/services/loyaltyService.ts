import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POINTS_PER_DOLLAR = parseInt(process.env.POINTS_PER_PURCHASE_DOLLAR ?? '1', 10);

/**
 * Award loyalty points after a successful order.
 * Points = floor(orderTotal × POINTS_PER_DOLLAR)
 */
export async function awardPointsForOrder(
  userId: string,
  orderId: string,
  orderTotal: number,
): Promise<void> {
  const points = Math.floor(orderTotal * POINTS_PER_DOLLAR);
  if (points <= 0) return;

  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      orderId,
      points,
      reason: `Purchase reward — order #${orderId.slice(0, 8)}`,
    },
  });
}

export async function getUserTotalPoints(userId: string): Promise<number> {
  const result = await prisma.loyaltyTransaction.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}
