import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { ordersApi } from '../../services/api';
import CartItemComponent from '../../components/CartItem';
import Button from '../../components/ui/Button';
import { formatPrice } from '../../utils/formatPrice';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../../theme/spacing';

export default function CartScreen() {
  const { items, fetchCart, removeItem, updateItem, getTotal, getItemCount, isLoading } = useCartStore();
  const [ordering, setOrdering] = useState(false);

  useEffect(() => { fetchCart(); }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    Alert.alert(
      'Realizar pedido',
      `¿Confirmar tu pedido por ${formatPrice(getTotal())}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setOrdering(true);
            try {
              await ordersApi.placeOrder();
              fetchCart();
              Alert.alert('¡Pedido realizado! 🎉', 'Gracias por tu compra. Tu pedido está siendo procesado.');
            } catch {
              Alert.alert('Error', 'No se pudo realizar el pedido. Inténtalo de nuevo.');
            } finally {
              setOrdering(false);
            }
          },
        },
      ],
    );
  };

  const isEmpty = items.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h2}>Tu carrito</Text>
        {!isEmpty && (
          <Text style={styles.count}>{getItemCount()} artículo{getItemCount() !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={72} color={Colors.textMuted} />
          <Text style={[Typography.h3, { marginTop: Spacing.lg }]}>Tu carrito está vacío</Text>
          <Text style={[Typography.bodySmall, { textAlign: 'center', marginTop: Spacing.sm }]}>
            Explora nuestra colección y agrega algo hermoso
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CartItemComponent
                item={item}
                onRemove={() => removeItem(item.id)}
                onIncrease={() => updateItem(item.id, item.quantity + 1)}
                onDecrease={() => {
                  if (item.quantity === 1) removeItem(item.id);
                  else updateItem(item.id, item.quantity - 1);
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          />

          {/* Order Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(getTotal())}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>Gratis</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(getTotal())}</Text>
            </View>

            <Button
              label="Realizar pedido"
              onPress={handleCheckout}
              loading={ordering}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.base }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.base,
  },
  count: { fontSize: FontSize.sm, color: Colors.textSecondary },
  list: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.lg },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  summary: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: 32,
    gap: Spacing.sm,
    ...Shadow.lg,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
});
