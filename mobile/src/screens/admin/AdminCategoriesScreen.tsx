import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { categoriesApi } from '../../services/api';
import { Category } from '../../types';
import { AdminCategoriesProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

// Derive backoffice URL from API base (http://192.168.0.3:3001/api -> http://192.168.0.3:5176)
const getBackofficeUrl = () => {
  const apiBase = 'http://192.168.0.3:3001/api';
  const url = new URL(apiBase);
  url.port = '5176';
  url.pathname = '';
  return url.toString().replace(/\/$/, '');
};

const BACKOFFICE_URL = getBackofficeUrl();

export default function AdminCategoriesScreen({ navigation }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesApi.list();
      setCategories(data.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
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
        <Text style={styles.title}>Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Add Category Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          const url = `${BACKOFFICE_URL}/admin/categories?token=${token}`;
          Linking.openURL(url).catch(err =>
            Alert.alert('Error', 'Could not open web admin. Make sure the backoffice URL is correct.')
          );
        }}
      >
        <MaterialCommunityIcons name="plus" size={20} color={Colors.background} />
        <Text style={styles.addButtonText}>Add New Category</Text>
      </TouchableOpacity>

      {/* Categories List */}
      <View style={styles.categoriesContainer}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="folder-open" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No categories yet</Text>
          </View>
        ) : (
          categories.map((category, index) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name="folder" size={32} color={Colors.primary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categorySlug}>{category.slug}</Text>
              </View>
              <Text style={styles.categoryOrder}>#{index + 1}</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  const url = `${BACKOFFICE_URL}/admin/categories?token=${token}&categoryId=${category.id}`;
                  Linking.openURL(url).catch(err =>
                    Alert.alert('Error', 'Could not open web admin')
                  );
                }}
              >
                <MaterialCommunityIcons name="pencil" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <MaterialCommunityIcons name="lightbulb" size={16} color={Colors.primary} />
        <Text style={styles.footerText}>Organize your products by creating meaningful categories for easy browsing.</Text>
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
  categoriesContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categorySlug: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryOrder: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
