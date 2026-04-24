import { NavLink } from 'react-router-dom';
import { useAdminAuthStore } from '../store/authStore';

const nav = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/products', icon: '🛍️', label: 'Products' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/admin/users', icon: '🔐', label: 'Admin Users' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/loyalty', icon: '⭐', label: 'Loyalty' },
];

export default function Sidebar() {
  const { admin, logout } = useAdminAuthStore();

  return (
    <aside className="w-60 flex-shrink-0 min-h-screen bg-surface-DEFAULT border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
            M
          </div>
          <div>
            <p className="text-white font-bold text-sm">Malamia</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-secondary'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold">
            {admin?.firstName?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-gray-500 text-xs truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors px-1 py-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
