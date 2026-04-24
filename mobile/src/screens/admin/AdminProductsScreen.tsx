import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { productsApi } from '../../services/api';
import { Product } from '../../types';
import { AdminProductsProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

// Derive backoffice URL from API base
const getBackofficeUrl = () => {
  // For local backoffice dev server
  return 'http://192.168.0.3:5173';
};

const BACKOFFICE_URL = getBackofficeUrl();

export default function AdminProductsScreen({ navigation }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await productsApi.list({ limit: 20 });
      setProducts(data.data.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Products</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Add Product Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          const url = `${BACKOFFICE_URL}/admin/products?token=${token}`;
          Linking.openURL(url).catch(err => 
            Alert.alert('Error', 'Could not open web admin. Make sure the backoffice URL is correct.')
          );
        }}
      >
        <MaterialCommunityIcons name="plus" size={20} color={Colors.background} />
        <Text style={styles.addButtonText}>Add New Product</Text>
      </TouchableOpacity>

      {/* Products List */}
      <View style={styles.productsContainer}>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-open" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No products yet</Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              {product.images && product.images.length > 0 ? (
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <MaterialCommunityIcons name="image" size={32} color={Colors.textTertiary} />
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
                <View style={styles.productMeta}>
                  <View style={[styles.badge, product.isPublished ? styles.badgePublished : styles.badgeDraft]}>
                    <Text style={styles.badgeText}>{product.isPublished ? 'Published' : 'Draft'}</Text>
                  </View>
                  <Text style={styles.stock}>{product.stock} in stock</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  const url = `${BACKOFFICE_URL}/admin/products?token=${token}&productId=${product.id}`;
                  Linking.openURL(url).catch(err =>
                    Alert.alert('Error', 'Could not open web admin')
                  );
                }}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>💡 Full product management (image upload, pricing, stock) is available in the web admin panel.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background,
  },
  productsContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: Colors.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePublished: {
    backgroundColor: '#10B98110',
  },
  badgeDraft: {
    backgroundColor: Colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stock: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  editButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
