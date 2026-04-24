import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { FontSize } from '../theme/typography';

const typeConfig = {
  NEW_PRODUCT: { icon: 'sparkles-outline' as const, color: Colors.primary, label: 'Nuevo producto' },
  PRICE_CHANGE: { icon: 'pricetag-outline' as const, color: Colors.warning, label: 'Precio actualizado' },
  PROMOTION: { icon: 'gift-outline' as const, color: Colors.success, label: 'Promoción' },
  ORDER_UPDATE: { icon: 'cube-outline' as const, color: Colors.info, label: 'Pedido actualizado' },
};

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const config = typeConfig[notification.type] ?? typeConfig.PROMOTION;
  const timeAgo = formatRelativeTime(notification.sentAt);

  return (
    <TouchableOpacity
      style={[styles.item, !notification.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBg, { backgroundColor: `${config.color}22` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.typeLabel}>{config.label}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
      </View>
      {!notification.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.md,
    position: 'relative',
  },
  unread: {
    backgroundColor: Colors.cardElevated,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dot: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
