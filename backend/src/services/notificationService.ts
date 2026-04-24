import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Initialize Firebase Admin (lazy — only on first call)
let firebaseInitialized = false;

function ensureFirebase() {
  if (firebaseInitialized) return;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    console.warn('[Notifications] Firebase service account not found. Push notifications disabled.');
    return;
  }
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  firebaseInitialized = true;
}

interface NotifPayload {
  title: string;
  body: string;
  type: 'NEW_PRODUCT' | 'PRICE_CHANGE' | 'PROMOTION' | 'ORDER_UPDATE';
  imageUrl?: string;
  data?: Record<string, unknown>;
  createdBy: string;
}

async function persistAndSend(
  userIds: string[],
  payload: NotifPayload,
): Promise<void> {
  const { title, body, type, imageUrl, data, createdBy } = payload;

  // Persist notification record
  const notification = await prisma.notification.create({
    data: {
      title, body,
      type,
      imageUrl,
      data: data ? data as object : undefined,
      createdBy,
    },
  });

  // Create per-user notification records
  if (userIds.length > 0) {
    await prisma.userNotification.createMany({
      data: userIds.map((userId) => ({ userId, notificationId: notification.id })),
      skipDuplicates: true,
    });
  }

  // Send FCM push via Expo push tokens
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, pushToken: { not: null } },
    select: { pushToken: true },
  });

  const expoPushTokens = users
    .map((u) => u.pushToken!)
    .filter((t) => t.startsWith('ExponentPushToken'));

  if (expoPushTokens.length === 0) return;

  // Send via Expo Push Notification Service (HTTP API)
  const messages = expoPushTokens.map((to) => ({
    to,
    title,
    body,
    data: { type, notificationId: notification.id, ...(data ?? {}) },
    ...(imageUrl ? { image: imageUrl } : {}),
    sound: 'default',
    priority: 'high',
  }));

  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
  // Batch in chunks of 100 (Expo limit)
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      });
    } catch (err) {
      console.error('[Notifications] Push send error:', err);
    }
  }
}

export async function sendPushNotificationToAll(payload: NotifPayload): Promise<void> {
  ensureFirebase();
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  await persistAndSend(users.map((u) => u.id), payload);
}

export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: NotifPayload,
): Promise<void> {
  ensureFirebase();
  await persistAndSend(userIds, payload);
}
