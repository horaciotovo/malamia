import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { dashboardApi } from '../../services/api';
import { AdminDashboardProps } from '../../navigation/types';

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await dashboardApi.getStats();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ icon, label, value, color, onPress }: { icon: string; label: string; value: string | number; color: string; onPress?: () => void }) => (
    <TouchableOpacity 
      style={[styles.kpiCard, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );

  const AdminAction = ({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) => (
    <TouchableOpacity style={[styles.actionButton, { borderColor: color }]} onPress={onPress}>
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>👑 Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage your store</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <KPICard 
          icon="package" 
          label="Products" 
          value={stats?.totalProducts ?? 0} 
          color={Colors.primary}
          onPress={() => navigation.navigate('AdminProducts')}
        />
        <KPICard 
          icon="check-circle" 
          label="Published" 
          value={stats?.publishedProducts ?? 0} 
          color="#10B981"
          onPress={() => navigation.navigate('AdminProducts')}
        />
        <KPICard 
          icon="account-multiple" 
          label="Customers" 
          value={stats?.totalCustomers ?? 0} 
          color="#3B82F6"
          onPress={() => navigation.navigate('AdminCustomers')}
        />
        <KPICard 
          icon="shopping" 
          label="Orders" 
          value={stats?.totalOrders ?? 0} 
          color="#F59E0B"
          onPress={() => navigation.navigate('AdminOrders')}
        />
        <KPICard 
          icon="cash-multiple" 
          label="Revenue" 
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} 
          color="#8B5CF6" 
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <AdminAction
            icon="plus-circle"
            label="New Product"
            color={Colors.primary}
            onPress={() => navigation.navigate('AdminProducts')}
          />
          <AdminAction
            icon="bell-ring"
            label="Send Notification"
            color="#F59E0B"
            onPress={() => navigation.navigate('AdminNotifications')}
          />
          <AdminAction
            icon="folder-plus"
            label="Categories"
            color="#10B981"
            onPress={() => navigation.navigate('AdminCategories')}
          />
          <AdminAction
            icon="pencil"
            label="Products"
            color={Colors.primary}
            onPress={() => navigation.navigate('AdminProducts')}
          />
        </View>
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
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  kpiLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.text,
    marginTop: Spacing.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
