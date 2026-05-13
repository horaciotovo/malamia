import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { notificationsAdminApi, customersApi } from '../../services/api';
import { Notification, NotificationType } from '../../types';
import { AdminNotificationsProps } from '../../navigation/types';

type NotifType = 'NEW_PRODUCT' | 'PRICE_CHANGE' | 'PROMOTION' | 'ORDER_UPDATE';

const TYPES: { value: NotifType; label: string; icon: string; color: string }[] = [
  { value: 'NEW_PRODUCT', label: 'Nuevo Producto', icon: 'star', color: '#EC4899' },
  { value: 'PRICE_CHANGE', label: 'Cambio de Precio', icon: 'tag', color: '#F59E0B' },
  { value: 'PROMOTION', label: 'Promoción', icon: 'gift', color: '#10B981' },
  { value: 'ORDER_UPDATE', label: 'Actualización de Pedido', icon: 'package', color: '#3B82F6' },
];

export default function AdminNotificationsScreen({ navigation }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [targetAll, setTargetAll] = useState(true);
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'PROMOTION' as NotifType,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsAdminApi.list();
      setNotifications(data.data.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert('Por favor completa el título y el mensaje');
      return;
    }

    setSending(true);
    try {
      await notificationsAdminApi.send({
        title: form.title,
        body: form.body,
        type: form.type,
        targetAll,
      });
      setForm({ title: '', body: '', type: 'PROMOTION' });
      setShowForm(false);
      await loadNotifications();
      Alert.alert('✅ ¡Notificación enviada!');
    } catch (err) {
      console.error('Send error:', err);
      Alert.alert('Fallo al enviar la notificación');
    } finally {
      setSending(false);
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
        <Text style={styles.title}>Notificaciones Push</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Send Button */}
      {!showForm && (
        <TouchableOpacity style={styles.sendButton} onPress={() => setShowForm(true)}>
          <MaterialCommunityIcons name="plus" size={20} color={Colors.background} />
          <Text style={styles.sendButtonText}>Enviar Notificación</Text>
        </TouchableOpacity>
      )}

      {/* Send Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>📤 Nueva Notificación</Text>

          {/* Tipo Selector */}
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeButton, form.type === t.value && styles.typeButtonActive]}
                onPress={() => setForm({ ...form, type: t.value })}
              >
                <MaterialCommunityIcons
                  name={t.icon as any}
                  size={20}
                  color={form.type === t.value ? t.color : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    form.type === t.value && { color: t.color, fontWeight: '700' },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Título */}
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="p.ej., ¡Nuevo Suero Rose llegó!"
            placeholderTextColor={Colors.textTertiary}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />

          {/* Mensaje */}
          <Text style={styles.label}>Mensaje *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Escribe tu mensaje de notificación..."
            placeholderTextColor={Colors.textTertiary}
            value={form.body}
            onChangeText={(text) => setForm({ ...form, body: text })}
            multiline
            numberOfLines={4}
          />

          {/* Objetivo */}
          <View style={styles.targetSwitch}>
            <View>
              <Text style={styles.label}>Audiencia Objetivo</Text>
              <Text style={styles.targetLabel}>
                {targetAll ? 'Todos los Clientes' : 'Clientes Específicos'}
              </Text>
            </View>
            <Switch
              value={targetAll}
              onValueChange={setTargetAll}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>

          {/* Actions */}
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSend}
              disabled={sending}
            >
              <MaterialCommunityIcons name="send" size={18} color={Colors.background} />
              <Text style={styles.submitButtonText}>
                {sending ? 'Enviando...' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* History */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bell-off" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}¡Sin notificaciones enviadas aún</Text>
        </View>
      ) : (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Notificaciones Recientes</Text>
          {notifications.slice(0, 5).map((notif) => (
            <View key={notif.id} style={styles.notifCard}>
              <View
                style={[
                  styles.notifIcon,
                  { backgroundColor: TYPES.find((t) => t.value === notif.type)?.color ?? Colors.primary + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={TYPES.find((t) => t.value === notif.type)?.icon as any}
                  size={20}
                  color={TYPES.find((t) => t.value === notif.type)?.color ?? Colors.primary}
                />
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {notif.body}
                </Text>
                <Text style={styles.notifTime}>
                  {new Date(notif.sentAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  sendButton: {
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
  sendButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background,
  },
  form: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  targetSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  targetLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background,
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
  historyContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notifBody: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
