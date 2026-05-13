import { useEffect, useState } from 'react'
import { notificationsApi } from '../services/api'
import '../styles/Notifications.css'

interface Notification {
  id: string
  title: string
  body: string
  type?: string
  sentAt: string
  isRead?: boolean
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsApi.getMyNotifications()
      setNotifications(response.data.data || [])
    } catch (err) {
      setError('Fallo al cargar notificaciones')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Fallo al marcar como leído:', err)
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return '📦'
      case 'promotion':
        return '🎉'
      case 'loyalty':
        return '⭐'
      case 'alert':
        return '⚠️'
      default:
        return '🔔'
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Cargando notificaciones...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>

  return (
    <div className="notifications">
      <h1>Notificaciones</h1>

      {notifications.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
          Sin notificaciones
        </p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p>{notification.body}</p>
                <h3>{notification.title}</h3>
                <span className="notification-date">
                  {new Date(notification.sentAt).toLocaleDateString()}
                </span>
              </div>
              {!notification.isRead && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
