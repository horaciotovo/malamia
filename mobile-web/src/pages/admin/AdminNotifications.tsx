import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { notificationsAdminApi, customersApi } from '../../services/api'
import './AdminNotifications.css'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  imageUrl?: string
  sentAt: string
  createdBy?: string
}

interface Customer {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

type NotificationType = 'NEW_PRODUCT' | 'PRICE_CHANGE' | 'PROMOTION' | 'ORDER_UPDATE'

const TYPE_OPTIONS: { value: NotificationType; label: string; icon: string }[] = [
  { value: 'NEW_PRODUCT', label: 'Nuevo Producto', icon: '✨' },
  { value: 'PRICE_CHANGE', label: 'Cambio de Precio', icon: '🏷️' },
  { value: 'PROMOTION', label: 'Promoción', icon: '🎁' },
  { value: 'ORDER_UPDATE', label: 'Actualización de Pedido', icon: '📦' },
]

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'PROMOTION' as NotificationType,
    imageUrl: '',
    targetAll: true,
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (showForm && !form.targetAll && customers.length === 0) {
      fetchCustomers()
    }
  }, [showForm, form.targetAll])

  const fetchNotifications = async () => {
    try {
      setError(null)
      const response = await notificationsAdminApi.list()
      setNotifications(response.data.data.data || [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError('Fallo al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.list({ limit: 100 })
      setCustomers(response.data.data.data || [])
    } catch (err) {
      console.error('Failed to load customers:', err)
      toast.error('Fallo al cargar clientes')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.body.trim()) {
      toast.error('El título y el mensaje son requeridos')
      return
    }

    if (!form.targetAll && selectedCustomers.size === 0) {
      toast.error('Por favor selecciona al menos un cliente')
      return
    }

    setSending(true)
    try {
      await notificationsAdminApi.send({
        title: form.title,
        body: form.body,
        type: form.type,
        imageUrl: form.imageUrl || undefined,
        targetAll: form.targetAll,
        targetUserIds: form.targetAll ? undefined : Array.from(selectedCustomers),
      })

      setForm({ title: '', body: '', type: 'PROMOTION', imageUrl: '', targetAll: true })
      setSelectedCustomers(new Set())
      setShowForm(false)
      await fetchNotifications()
      toast.success('¡Notificación enviada exitosamente!')
    } catch (err) {
      console.error('Send error:', err)
      toast.error('Fallo al enviar la notificación')
    } finally {
      setSending(false)
    }
  }

  const toggleCustomer = (customerId: string) => {
    const newSet = new Set(selectedCustomers)
    if (newSet.has(customerId)) {
      newSet.delete(customerId)
    } else {
      newSet.add(customerId)
    }
    setSelectedCustomers(newSet)
  }

  if (loading) {
    return (
      <div className="admin-notifications">
        <div className="loading">Cargando notificaciones...</div>
      </div>
    )
  }

  return (
    <div className="admin-notifications">
      {/* Header */}
      <div className="admin-notifications-header">
        <div>
          <h2>Notificaciones Push</h2>
          <p className="subtitle">{notifications.length} notificaciones enviadas</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="send-btn">
            ➕ Enviar Notificación
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchNotifications} className="retry-link">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Send Form */}
      {showForm && (
        <form onSubmit={handleSend} className="notification-form">
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Nueva Colección Disponible"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Mensaje</label>
            <textarea
              id="body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Ej: Echa un vistazo a nuestros nuevos productos..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL de Imagen (opcional)</label>
            <input
              id="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.targetAll}
                onChange={(e) => setForm({ ...form, targetAll: e.target.checked })}
              />
              Enviar a todos los clientes
            </label>
          </div>

          {!form.targetAll && (
            <div className="form-group">
              <label>Selecciona clientes</label>
              <div className="customer-list">
                {customers.map((customer) => (
                  <label key={customer.id} className="customer-item">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={() => toggleCustomer(customer.id)}
                    />
                    <span>{customer.firstName || customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.email}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={sending} className="submit-btn">
              {sending ? 'Enviando...' : 'Enviar Notificación'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setForm({ title: '', body: '', type: 'PROMOTION', imageUrl: '', targetAll: true })
                setSelectedCustomers(new Set())
              }}
              className="cancel-btn"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Notifications History */}
      <div className="notifications-history">
        <h3>Historial de Notificaciones</h3>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>📭 Sin notificaciones enviadas aún</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div key={notif.id} className="notification-item">
                <div className="notification-header">
                  <h4>{notif.title}</h4>
                  <span className="notification-type">{notif.type}</span>
                </div>
                <p className="notification-body">{notif.body}</p>
                <span className="notification-date">{new Date(notif.sentAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Link */}
      <Link to="/admin" className="back-link">
        ← Volver al panel
      </Link>
    </div>
  )
}
