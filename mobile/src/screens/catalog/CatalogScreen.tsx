import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CatalogScreenProps } from '../../navigation/types';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Product } from '../../types';

export default function CatalogScreen({ navigation, route }: CatalogScreenProps) {
  const initialCategory = route.params?.categoryId ?? null;
  const { products, categories, isLoading, isLoadingMore, fetchProducts, fetchCategories, setCategory, setSearch, selectedCategory, loadMore } = useProductStore();
  const { addItem } = useCartStore();
  const [search, setSearchLocal] = useState('');

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    fetchCategories();
    fetchProducts(true);
  }, []);

  const handleSearch = (text: string) => {
    setSearchLocal(text);
    const timer = setTimeout(() => setSearch(text), 400);
    return () => clearTimeout(timer);
  };

  const handleAddToCart = async (product: Product) => {
    try { await addItem(product); } catch { /* toast */ }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Search bar ──────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchLocal(''); setSearch(''); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Categories ──────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
        <TouchableOpacity
          style={[styles.catChip, !selectedCategory && styles.catChipActive]}
          onPress={() => setCategory(null)}
        >
          <Text style={[styles.catLabel, !selectedCategory && styles.catLabelActive]}>Todos</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
            onPress={() => setCategory(cat.id)}
          >
            <Text style={[styles.catLabel, selectedCategory === cat.id && styles.catLabelActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Products grid ───────────────────── */}
      {isLoading && products.length === 0 ? (
        <LoadingSpinner message="Cargando productos…" />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.grid}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
          ListFooterComponent={isLoadingMore ? <LoadingSpinner /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptySubtitle}>Intenta otra búsqueda o categoría</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: Spacing.screen, paddingVertical: Spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  catScroll: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.md, gap: Spacing.sm },
  catChip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  catLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  catLabelActive: { color: Colors.primary, fontWeight: '600' },
  grid: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing['2xl'] },
  productRow: { justifyContent: 'space-between', marginBottom: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.md },
  emptyTitle: { ...Typography.h3, color: Colors.textSecondary },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textTertiary },
});
