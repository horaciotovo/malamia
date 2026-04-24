import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { customersApi } from '../../services/api';
import { AdminCustomersProps } from '../../navigation/types';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  loyaltyPoints: number;
  role: 'CUSTOMER' | 'ADMIN';
}

export default function AdminCustomersScreen({ navigation }: AdminCustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data } = await customersApi.list({ limit: 100 });
      setCustomers(data.data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
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

  const renderCustomer = ({ item }: { item: Customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: item.role === 'ADMIN' ? '#EF4444' : '#10B981' }]}>
              <Text style={styles.badgeText}>{item.role}</Text>
            </View>
            <Text style={styles.points}>⭐ {item.loyaltyPoints} pts</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Customers</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
      />
    </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  customerCard: {
    backgroundColor: '#1a202c',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  customerInfo: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#a0aec0',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
  points: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '500',
  },
});
