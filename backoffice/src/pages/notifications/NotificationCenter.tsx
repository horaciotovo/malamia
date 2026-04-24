import React, { useEffect, useState } from 'react';
import { notificationsApi, customersApi } from '../../services/api';
import { Notification, NotificationType, User } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const typeOptions: { value: NotificationType; label: string; icon: string; description: string }[] = [
  { value: 'NEW_PRODUCT', label: 'New Product', icon: '✨', description: 'Announce a new product' },
  { value: 'PRICE_CHANGE', label: 'Price Change', icon: '🏷️', description: 'Notify about price updates' },
  { value: 'PROMOTION', label: 'Promotion', icon: '🎁', description: 'Custom promotional message' },
  { value: 'ORDER_UPDATE', label: 'Order Update', icon: '📦', description: 'Order status notification' },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'PROMOTION' as NotificationType,
    imageUrl: '',
    targetAll: true,
  });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (modalOpen && !form.targetAll && customers.length === 0) {
      loadCustomers();
    }
  }, [modalOpen, form.targetAll]);

  const load = async () => {
    try {
      setError(null);
      const { data } = await notificationsApi.list();
      setNotifications(data.data.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const { data } = await customersApi.list({ limit: 100 });
      setCustomers(data.data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
      alert('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      alert('Title and message are required');
      return;
    }

    if (!form.targetAll && selectedUsers.size === 0) {
      alert('Please select at least one customer');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        type: form.type,
        imageUrl: form.imageUrl || undefined,
        targetAll: form.targetAll,
        targetUserIds: form.targetAll ? undefined : Array.from(selectedUsers),
      };

      await notificationsApi.send(payload);
      setModalOpen(false);
      setForm({ title: '', body: '', type: 'PROMOTION', imageUrl: '', targetAll: true });
      setSelectedUsers(new Set());
      load();
      alert('✅ Notification sent successfully!');
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const typeIcon: Record<NotificationType, string> = {
    NEW_PRODUCT: '✨',
    PRICE_CHANGE: '🏷️',
    PROMOTION: '🎁',
    ORDER_UPDATE: '📦',
  };

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Push Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">{notifications.length} notifications sent</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <span>➕</span> Send Notification
        </Button>
      </div>

      {/* Notifications History */}
      <div className="space-y-3">
        {error && (
          <div className="card p-4 border-red-500/50 bg-red-500/10">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
            <button
              onClick={() => load()}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))
          : notifications.length === 0
          ? (
              <div className="card p-12 text-center">
                <p className="text-6xl mb-4">🔔</p>
                <p className="text-white font-semibold text-lg">No notifications sent yet</p>
                <p className="text-gray-500 text-sm mt-2">Send your first push notification to all customers</p>
              </div>
            )
          : notifications.map((n) => (
              <div key={n.id} className="card p-4 hover:bg-surface-secondary/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-semibold">{n.title}</span>
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {n.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{n.body}</p>
                    <p className="text-gray-600 text-xs">
                      📅 {new Date(n.sentAt).toLocaleDateString()} at {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Send Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="📤 Send Push Notification" size="lg">
        <form onSubmit={handleSend} className="space-y-5">
          {/* Type Selector */}
          <div>
            <label className="text-sm font-semibold !text-white block mb-3">Notification Type</label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={`p-3 rounded-lg border text-sm transition-all text-left ${
                    form.type === opt.value
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:bg-surface-secondary/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                  </div>
                  <p className="text-xs opacity-75">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Input
              label="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., New Rose Serum just dropped! ✨"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-semibold !text-white block mb-2">Message *</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write your push notification message…"
              required
              className="w-full bg-surface-secondary border border-gray-700 rounded-lg px-4 py-2.5 !text-white text-sm placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-24 resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <Input
              label="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          {/* Target Selection */}
          <div className="bg-surface-secondary/50 p-4 rounded-lg space-y-3">
            <label className="text-sm font-semibold !text-white block">Target Audience</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="target"
                checked={form.targetAll}
                onChange={() => {
                  setForm({ ...form, targetAll: true });
                  setSelectedUsers(new Set());
                }}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <p className="text-white text-sm font-medium">Send to All Customers</p>
                <p className="text-gray-500 text-xs">Push notification delivered to all users</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="target"
                checked={!form.targetAll}
                onChange={() => {
                  setForm({ ...form, targetAll: false });
                  if (customers.length === 0) loadCustomers();
                }}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <p className="text-white text-sm font-medium">Send to Specific Customers</p>
                <p className="text-gray-500 text-xs">Select individual users below</p>
              </div>
            </label>
          </div>

          {/* Customer Selection */}
          {!form.targetAll && (
            <div className="bg-surface-secondary/30 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-300 text-sm font-medium">
                  Selected: {selectedUsers.size} customer{selectedUsers.size !== 1 ? 's' : ''}
                </p>
                {selectedUsers.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedUsers(new Set())}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {loadingCustomers ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No customers found</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {customers.map((customer) => (
                    <label key={customer.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-secondary/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(customer.id)}
                        onChange={() => toggleUser(customer.id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{customer.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending || (!form.targetAll && selectedUsers.size === 0)}>
              {sending ? '⏳ Sending...' : '✈️ Send Notification'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
