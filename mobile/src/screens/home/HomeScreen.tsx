import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { HomeScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../../theme/spacing';
import { Product } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuthStore();
  const { featuredProducts, categories, fetchFeatured, fetchCategories, isLoading } = useProductStore();
  const { addItem } = useCartStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchFeatured();
    fetchCategories();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product);
    } catch {
      // show toast in production
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ──────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hola, {user?.firstName ?? 'ahí'} 👋
            </Text>
            <Text style={styles.subtitle}>Descubre tus nuevos favoritos</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            {user?.avatar ? (
              Platform.OS === 'web' ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    objectFit: 'cover',
                  } as React.CSSProperties}
                />
              ) : (
                <ExpoImage source={{ uri: user.avatar }} style={styles.avatarImg} contentFit="cover" />
              )
            ) : (
              <LinearGradient colors={Colors.gradientPrimary} style={styles.avatarGradient}>
                <Text style={styles.avatarInitial}>
                  {user?.firstName?.[0]?.toUpperCase() ?? 'M'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Hero Banner ─────────────────────── */}
        <Animated.View style={[styles.heroBanner, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={Colors.gradientHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTag}>Nueva Colección</Text>
              <Text style={styles.heroTitle}>Invierno 2026</Text>
              <Text style={styles.heroSubtitle}>Elegancia redefinida</Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => navigation.navigate('Catalog', {})}
              >
                <Text style={styles.heroBtnText}>Ver ahora</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.heroDecor}>
              <Ionicons name="sparkles" size={80} color="rgba(255,255,255,0.15)" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Categories ──────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={Typography.h3}>Categorías</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalog', {})}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catChip}
                onPress={() => navigation.navigate('Catalog', { categoryId: cat.id })}
              >
                <Text style={styles.catLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Featured Products ────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={Typography.h3}>Destacados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalog', {})}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View style={styles.skeletonGrid}>
              {[1, 2, 3, 4].map((k) => <View key={k} style={styles.skeleton} />)}
            </View>
          ) : (
            <FlatList
              data={featuredProducts}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                  onAddToCart={() => handleAddToCart(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Sin productos destacados aún</Text>
                </View>
              }
            />
          )}
        </View>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  avatarImg: { width: 44, height: 44 },
  avatarGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: Colors.white },
  heroBanner: {
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadow.pink,
  },
  heroGradient: { padding: Spacing.xl, minHeight: 160, flexDirection: 'row', alignItems: 'center' },
  heroContent: { flex: 1 },
  heroDecor: { position: 'absolute', right: -10, top: -10, opacity: 0.7 },
  heroTag: { fontSize: FontSize.xs, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: FontSize['3xl'], fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.base,
  },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  section: { paddingHorizontal: Spacing.screen, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  catScroll: { paddingRight: Spacing.screen, gap: Spacing.sm },
  catChip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  productRow: { justifyContent: 'space-between', marginBottom: Spacing.md },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  skeleton: {
    width: (width - Spacing.screen * 2 - Spacing.md) / 2,
    aspectRatio: 3 / 5,
    backgroundColor: Colors.shimmerBase,
    borderRadius: BorderRadius.lg,
  },
  empty: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.textTertiary },
});
