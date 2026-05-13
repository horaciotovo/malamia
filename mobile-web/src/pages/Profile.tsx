import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import '../styles/Profile.css'

export default function Profile() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="profile">
      <h1>Mi Cuenta</h1>

      {user && (
        <>
          <div className="profile-card">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2>
                {user.firstName} {user.lastName}
              </h2>
              <p className="email">{user.email}</p>
              {user.phone && <p className="phone">{user.phone}</p>}
            </div>
          </div>

          {user.loyaltyPoints !== undefined && (
            <div className="loyalty-summary">
              <div className="loyalty-item">
                <span className="label">Puntos de Lealtad</span>
                <span className="value">{user.loyaltyPoints}</span>
              </div>
              {user.role && (
                <div className="loyalty-item">
                  <span className="label">Tipo de Cuenta</span>
                  <span className="value">{user.role}</span>
                </div>
              )}
            </div>
          )}

          <div className="profile-sections">
            <div className="profile-section">
              <h3>Cuenta</h3>
              <button
                onClick={() => navigate('/account/settings')}
                className="section-button"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => navigate('/account/password')}
                className="section-button"
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={() => navigate('/account/addresses')}
                className="section-button"
              >
                Direcciones
              </button>
            </div>

            <div className="profile-section">
              <h3>Preferencias</h3>
              <button
                onClick={() => navigate('/account/notifications')}
                className="section-button"
              >
                Configuración de Notificaciones
              </button>
              <button
                onClick={() => navigate('/account/privacy')}
                className="section-button"
              >
                Configuración de Privacidad
              </button>
            </div>

            <div className="profile-section">
              <h3>Soporte</h3>
              <button
                onClick={() => window.location.href = 'mailto:support@malamia.com'}
                className="section-button"
              >
                Contactar Soporte
              </button>
              <button
                onClick={() => navigate('/account/faq')}
                className="section-button"
              >
                Preguntas Frecuentes y Ayuda
              </button>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </>
      )}
    </div>
  )
}
