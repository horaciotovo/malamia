import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ProfileScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../../theme/spacing';

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const { data } = await ordersApi.getMyOrders({ limit: 5 });
      setOrders(data.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'star-outline' as const, label: 'Lealtad y Recompensas', onPress: () => navigation.navigate('Loyalty'), highlight: true },
    { icon: 'bag-outline' as const, label: 'Historial de pedidos', onPress: () => navigation.navigate('OrderHistory') },
    { icon: 'person-outline' as const, label: 'Editar perfil', onPress: () => {} },
    { icon: 'notifications-outline' as const, label: 'Preferencias de notificaciones', onPress: () => {} },
    { icon: 'help-circle-outline' as const, label: 'Ayuda y soporte', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile Hero ──────────────────── */}
        <LinearGradient
          colors={['rgba(232,68,138,0.12)', 'transparent']}
          style={styles.hero}
        >
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <LinearGradient colors={Colors.gradientPrimary} style={styles.avatarGradient}>
                <Text style={styles.avatarInitial}>
                  {user?.firstName?.[0]?.toUpperCase() ?? 'M'}
                </Text>
              </LinearGradient>
            )}
          </View>
          <Text style={[Typography.h2, { marginTop: Spacing.md }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[Typography.bodySmall, { marginTop: 4 }]}>{user?.email}</Text>

          {/* Points pill */}
          <TouchableOpacity
            style={styles.pointsPill}
            onPress={() => navigation.navigate('Loyalty')}
          >
            <Ionicons name="star" size={14} color={Colors.primary} />
            <Text style={styles.pointsText}>{user?.loyaltyPoints ?? 0} pts</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Recent Orders ──────────────────── */}
        {!loading && orders.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Pedidos recientes</Text>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{formatPrice(Number(order.totalAmount))}</Text>
                  <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                    <Text style={[styles.statusText, getStatusTextStyle(order.status)]}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Menu ──────────────────────────── */}
        <View style={styles.section}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, item.highlight && styles.menuItemHighlight]}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIcon, item.highlight && styles.menuIconHighlight]}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.highlight ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <Text style={[styles.menuLabel, item.highlight && { color: Colors.primary }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sign out ──────────────────────── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

function getStatusStyle(status: string) {
  const map: Record<string, object> = {
    DELIVERED: { backgroundColor: Colors.successSoft },
    CANCELLED: { backgroundColor: Colors.errorSoft },
    SHIPPED: { backgroundColor: Colors.infoSoft },
    CONFIRMED: { backgroundColor: Colors.primarySoft },
    PENDING: { backgroundColor: Colors.surface },
  };
  return map[status] ?? {};
}

function getStatusTextStyle(status: string) {
  const map: Record<string, object> = {
    DELIVERED: { color: Colors.success },
    CANCELLED: { color: Colors.error },
    SHIPPED: { color: Colors.info },
    CONFIRMED: { color: Colors.primary },
    PENDING: { color: Colors.textSecondary },
  };
  return map[status] ?? {};
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  hero: { alignItems: 'center', paddingVertical: Spacing['2xl'] },
  avatarContainer: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', ...Shadow.pink },
  avatar: { width: 88, height: 88 },
  avatarGradient: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: Colors.white },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  pointsText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  section: { paddingHorizontal: Spacing.screen, marginBottom: Spacing.xl },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  orderInfo: { gap: 4 },
  orderId: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textTertiary },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  orderTotal: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  menuItemHighlight: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconHighlight: { backgroundColor: 'rgba(232,68,138,0.2)' },
  menuLabel: { flex: 1, fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.screen,
    padding: Spacing.base,
    backgroundColor: Colors.errorSoft,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
  },
  signOutText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.error },
});
