import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MainTabParamList, HomeStackParamList, CatalogStackParamList, ProfileStackParamList, AdminStackParamList } from './types';
import { Colors } from '../theme/colors';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

import HomeScreen from '../screens/home/HomeScreen';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import ProductDetailScreen from '../screens/catalog/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoyaltyScreen from '../screens/loyalty/LoyaltyScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminCustomersScreen from '../screens/admin/AdminCustomersScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';

// ─── Stack navigators ─────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <HomeStack.Screen name="Catalog" component={CatalogScreen} />
    </HomeStack.Navigator>
  );
}

const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();
function CatalogStackNavigator() {
  return (
    <CatalogStack.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStack.Screen name="Catalog" component={CatalogScreen} />
      <CatalogStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </CatalogStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <ProfileStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <ProfileStack.Screen name="Loyalty" component={LoyaltyScreen} />
    </ProfileStack.Navigator>
  );
}

const AdminStack = createNativeStackNavigator<AdminStackParamList>();
function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AdminProducts" component={AdminProductsScreen} />
      <AdminStack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <AdminStack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
      <AdminStack.Screen name="AdminCustomers" component={AdminCustomersScreen} />
      <AdminStack.Screen name="AdminOrders" component={AdminOrdersScreen} />
    </AdminStack.Navigator>
  );
}

// ─── Bottom Tab ───────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
            HomeTab: { active: 'home', inactive: 'home-outline' },
            CatalogTab: { active: 'grid', inactive: 'grid-outline' },
            CartTab: { active: 'bag', inactive: 'bag-outline' },
            NotificationsTab: { active: 'notifications', inactive: 'notifications-outline' },
            AdminTab: { active: 'settings', inactive: 'settings-outline' },
            ProfileTab: { active: 'person', inactive: 'person-outline' },
          };
          const icon = icons[route.name];
          return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Inicio' }} />
      <Tab.Screen name="CatalogTab" component={CatalogStackNavigator} options={{ title: 'Tienda' }} />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Carrito',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Alertas' }} />
      {isAdmin && <Tab.Screen name="AdminTab" component={AdminStackNavigator} options={{ title: 'Admin' }} />}
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
