import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import cartRoutes from './cart';
import orderRoutes from './orders';
import loyaltyRoutes from './loyalty';
import notificationRoutes from './notifications';
import adminRoutes from './admin';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
