import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '../../services/api';
import { Notification } from '../../types';
import NotificationItem from '../../components/NotificationItem';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await notificationsApi.getMyNotifications();
      setNotifications(data.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Error al cargar notificaciones';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleMarkRead = async (userNotificationId: string) => {
    await notificationsApi.markAsRead(userNotificationId);
    setNotifications((prev) =>
      prev.map((n) => n.userNotificationId === userNotificationId ? { ...n, isRead: true } : n),
    );
  };

  const handleMarkAll = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <LoadingSpinner message="Loading notifications…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={Typography.h2}>Notificaciones</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadBadge}>{unreadCount} sin leer</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Button label="Marcar todo leído" onPress={handleMarkAll} variant="ghost" size="sm" />
        )}
      </View>

      {error ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={56} color={Colors.error} />
          <Text style={[Typography.h3, { marginTop: Spacing.lg, color: Colors.textSecondary }]}>
            No se pudo cargar
          </Text>
          <Text style={[Typography.bodySmall, { textAlign: 'center', marginTop: Spacing.sm, color: Colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>Toca para reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.userNotificationId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => !item.isRead && handleMarkRead(item.userNotificationId)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={64} color={Colors.textMuted} />
              <Text style={[Typography.h3, { marginTop: Spacing.lg, color: Colors.textSecondary }]}>
                Sin notificaciones aún
              </Text>
              <Text style={[Typography.bodySmall, { textAlign: 'center', marginTop: Spacing.sm }]}>
                Te avisaremos sobre nuevos productos y ofertas aquí
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.base,
  },
  unreadBadge: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  list: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing['2xl'] },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: Spacing['3xl'] },
  retryBtn: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  retryText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
});
