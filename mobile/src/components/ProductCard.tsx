import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { Colors } from '../theme/colors';
import { BorderRadius, Shadow, Spacing } from '../theme/spacing';
import { FontSize } from '../theme/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.screen * 2 - Spacing.md) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const imageUrl = product.images?.[0];
  const fallbackUrl = 'https://placehold.co/300x300/1A1A1A/E8448A?text=Malamia';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {isLoadingImage && !imageLoadFailed && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: imageLoadFailed ? fallbackUrl : (imageUrl || fallbackUrl) }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onLoadStart={() => setIsLoadingImage(true)}
          onLoad={() => setIsLoadingImage(false)}
          onError={() => {
            setIsLoadingImage(false);
            setImageLoadFailed(true);
          }}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {/* Featured dot */}
        {product.isFeatured && (
          <View style={styles.featuredDot} />
        )}

        {/* Add to cart button */}
        {onAddToCart && (
          <TouchableOpacity style={styles.addBtn} onPress={onAddToCart} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {hasDiscount && (
            <Text style={styles.comparePrice}>{formatPrice(product.compareAtPrice!)}</Text>
          )}
        </View>
        {product.stock === 0 && (
          <Text style={styles.outOfStock}>Out of stock</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: `${Colors.surface}80`,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  featuredDot: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  addBtn: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.pink,
  },
  info: {
    padding: Spacing.md,
    gap: 4,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  outOfStock: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: '500',
  },
});
