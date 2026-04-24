import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../../theme/spacing';

type Props = NativeStackScreenProps<ProfileStackParamList, 'OrderDetail'>;

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.warning,
  CONFIRMED: Colors.info,
  SHIPPED: Colors.primaryLight,
  DELIVERED: Colors.success,
  CANCELLED: Colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const STEP_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
};

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getOrderById(orderId)
      .then(({ data }) => setOrder(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingSpinner />;
  if (!order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalle del pedido</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.emptyTitle}>Pedido no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[order.status] ?? Colors.textSecondary;
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const date = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle del pedido</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Order meta */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Pedido</Text>
            <Text style={styles.value}>#{order.id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Estado</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '55' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[order.status] ?? order.status}</Text>
            </View>
          </View>
        </View>

        {/* Progress tracker (hidden for cancelled) */}
        {order.status !== 'CANCELLED' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progreso</Text>
            <View style={styles.stepsRow}>
              {STATUS_STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const color = done ? Colors.primary : Colors.textMuted;
                return (
                  <React.Fragment key={step}>
                    <View style={styles.stepItem}>
                      <View style={[styles.stepDot, { backgroundColor: done ? Colors.primary : Colors.surface, borderColor: color }]}>
                        {done && <Ionicons name="checkmark" size={10} color={Colors.white} />}
                      </View>
                      <Text style={[styles.stepLabel, { color }]}>{STEP_LABELS[step] ?? step}</Text>
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.stepLine, { backgroundColor: i < stepIndex ? Colors.primary : Colors.border }]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Artículos</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: item.product?.images?.[0] }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product?.name ?? 'Product'}</Text>
                <Text style={styles.itemQty}>Cant: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(Number(item.price) * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={[styles.section, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(Number(order.totalAmount))}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs, borderRadius: BorderRadius.sm },
  title: { ...Typography.h3, color: Colors.textPrimary } as any,
  scroll: { padding: Spacing.md, gap: Spacing.md },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '700', marginBottom: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm },
  value: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  statusBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  // progress
  stepsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  stepLine: { flex: 1, height: 2, marginBottom: 14, marginHorizontal: 2 },
  // items
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemImage: { width: 52, height: 52, borderRadius: BorderRadius.sm, backgroundColor: Colors.surface },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '500' },
  itemQty: { color: Colors.textTertiary, fontSize: FontSize.xs },
  itemPrice: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '700' },
  // total
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  totalValue: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.md } as any,
});
