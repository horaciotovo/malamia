import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { Colors } from '../theme/colors';
import { BorderRadius, Shadow, Spacing } from '../theme/spacing';
import { FontSize } from '../theme/typography';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function CartItem({ item, onRemove, onIncrease, onDecrease }: CartItemProps) {
  const product = item.product;
  if (!product) return null;

  const subtotal = product.price * item.quantity;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.images[0] ?? 'https://placehold.co/100x100/1A1A1A/E8448A?text=?' }}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <View style={styles.bottomRow}>
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={onDecrease}
              disabled={item.quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? Colors.textMuted : Colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
              <Ionicons name="add" size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtotal}>{formatPrice(subtotal)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  price: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    width: 28,
    textAlign: 'center',
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtotal: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
