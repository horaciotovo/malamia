import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductDetailProps } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { productsApi } from '../../services/api';
import { Product } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: ProductDetailProps) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCartStore();
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const { data } = await productsApi.getById(productId);
      setProduct(data.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el producto.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    try {
      await addItem(product, quantity);
      Alert.alert('¡Agregado al carrito! 🛗️', `${product.name} × ${quantity}`);
    } catch {
      Alert.alert('Error', 'No se pudo agregar al carrito.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando producto…" />;
  if (!product) return null;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasDiscount ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Images ──────────────────────────── */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[selectedImage] ?? 'https://placehold.co/400x500/1A1A1A/E8448A?text=Malamia' }}
            style={styles.mainImage}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.imageTopGradient} />
          <SafeAreaView style={styles.backBtn} edges={['top']}>
            <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbStrip}
            >
              {product.images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedImage(i)}>
                  <Image
                    source={{ uri: img }}
                    style={[styles.thumb, selectedImage === i && styles.thumbActive]}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Info ────────────────────────────── */}
        <View style={styles.infoSection}>
          {/* Category + badges */}
          <View style={styles.badgeRow}>
            {product.category && (
              <Badge label={product.category.name} variant="neutral" />
            )}
            {product.isFeatured && <Badge label="Featured" variant="primary" />}
            {hasDiscount && <Badge label={`-${discount}%`} variant="error" />}
          </View>

          <Text style={[Typography.h1, { marginTop: Spacing.md }]}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={Typography.priceLarge}>{formatPrice(product.price)}</Text>
            {hasDiscount && (
              <Text style={styles.comparePrice}>{formatPrice(product.compareAtPrice!)}</Text>
            )}
          </View>

          {/* Description */}
          <Text style={[Typography.body, { marginTop: Spacing.base, color: Colors.textSecondary }]}>
            {product.description}
          </Text>

          {/* Stock */}
          {product.stock > 0 ? (
            <View style={styles.stockRow}>
              <View style={styles.stockDot} />
              <Text style={styles.stockText}>{product.stock} en existencia</Text>
            </View>
          ) : (
            <Text style={styles.outOfStock}>Sin existencias</Text>
          )}

          {/* Quantity */}
          <View style={styles.qtySection}>
            <Text style={[Typography.label, { marginBottom: Spacing.sm }]}>Cantidad</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                <Ionicons name="add" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          {product.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {product.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Sticky Add to Cart ──────────────── */}
      <View style={styles.stickyBar}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(product.price * quantity)}</Text>
        </View>
        <Animated.View style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
          <Button
            label={product.stock === 0 ? 'Sin existencias' : 'Agregar al carrito'}
            onPress={handleAddToCart}
            loading={adding}
            disabled={product.stock === 0}
            fullWidth
            size="lg"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageSection: { position: 'relative' },
  mainImage: { width, height: width * 1.15 },
  imageTopGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  backBtn: { position: 'absolute', top: 0, left: Spacing.screen },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbStrip: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
  },
  thumb: { width: 60, height: 60, borderRadius: BorderRadius.sm, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: Colors.primary },
  infoSection: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.base },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  comparePrice: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.base },
  stockDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  stockText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '500' },
  outOfStock: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '600', marginTop: Spacing.base },
  qtySection: { marginTop: Spacing.xl },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { width: 44, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xl },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    ...Shadow.lg,
  },
  totalInfo: { alignItems: 'center' },
  totalLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, fontWeight: '500', textTransform: 'uppercase' },
  totalValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
});
