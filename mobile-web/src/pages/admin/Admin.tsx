import { Link } from 'react-router-dom'
import './Admin.css'

export default function Admin() {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p className="admin-subtitle">Gestiona tu tienda desde aquí</p>
      </div>

      <div className="admin-menu">
        <Link to="/admin/orders" className="admin-card">
          <div className="admin-card-icon">📦</div>
          <div className="admin-card-content">
            <h3>Gestión de Pedidos</h3>
            <p>Aprueba y gestiona pedidos de clientes</p>
          </div>
        </Link>
        <Link to="/admin/notifications" className="admin-card">
          <div className="admin-card-icon">🔔</div>
          <div className="admin-card-content">
            <h3>Notificaciones</h3>
            <p>Envía notificaciones push a tus clientes</p>
          </div>
        </Link>
      </div>

      <Link to="/" className="back-link">
        ← Volver al inicio
      </Link>
    </div>
  )
}
