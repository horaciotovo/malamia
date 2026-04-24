import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export type MainTabParamList = {
  HomeTab: undefined;
  CatalogTab: undefined;
  CartTab: undefined;
  NotificationsTab: undefined;
  AdminTab: undefined;
  ProfileTab: undefined;
};

// ─── Home Stack ───────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  Catalog: { categoryId?: string };
};

// ─── Catalog Stack ───────────────────────────────────────────────────────────
export type CatalogStackParamList = {
  Catalog: { categoryId?: string };
  ProductDetail: { productId: string };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  Profile: undefined;
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  Loyalty: undefined;
};

// ─── Admin Stack ──────────────────────────────────────────────────────────────
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminProducts: undefined;
  AdminNotifications: undefined;
  AdminCategories: undefined;
  AdminCustomers: undefined;
  AdminOrders: undefined;
};

// ─── Screen Props Helpers ─────────────────────────────────────────────────────
export type AuthLoginProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type AuthRegisterProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type ProductDetailProps = NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>;
export type CatalogScreenProps = NativeStackScreenProps<CatalogStackParamList, 'Catalog'>;
export type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;
export type OrderHistoryScreenProps = NativeStackScreenProps<ProfileStackParamList, 'OrderHistory'>;
export type OrderDetailScreenProps = NativeStackScreenProps<ProfileStackParamList, 'OrderDetail'>;
export type LoyaltyScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Loyalty'>;
export type AdminDashboardProps = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;
export type AdminProductsProps = NativeStackScreenProps<AdminStackParamList, 'AdminProducts'>;
export type AdminNotificationsProps = NativeStackScreenProps<AdminStackParamList, 'AdminNotifications'>;
export type AdminCategoriesProps = NativeStackScreenProps<AdminStackParamList, 'AdminCategories'>;
export type AdminCustomersProps = NativeStackScreenProps<AdminStackParamList, 'AdminCustomers'>;
export type AdminOrdersProps = NativeStackScreenProps<AdminStackParamList, 'AdminOrders'>;
