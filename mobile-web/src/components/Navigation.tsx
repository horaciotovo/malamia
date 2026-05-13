import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './Navigation.css'

export default function Navigation() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN'
  const isAuthPage = location.pathname.startsWith('/auth')

  if (isAuthPage) return null

  const navItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/catalog', label: 'Catálogo', icon: '🛍️' },
    { path: '/cart', label: 'Carrito', icon: '🛒' },
    { path: '/notifications', label: 'Notificaciones', icon: '🔔' },
    { path: '/orders', label: 'Pedidos', icon: '📦' },
    { path: '/profile', label: 'Perfil', icon: '👤' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: '⚙️' }] : []),
  ]

  return (
    <nav className="navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </Link>
      ))}
    </nav>
  )
}
