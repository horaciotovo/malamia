import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import Button from '../../components/ui/Button';

export default function AdminManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    load();
  }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllUsers({ page, limit, search: search || undefined });
      setUsers(data.data.data);
      setTotal(data.data.total);
    } catch {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'CUSTOMER' | 'ADMIN') => {
    setUpdating(userId);
    try {
      await adminApi.changeUserRole(userId, newRole);
      await load();
      alert(`User role changed to ${newRole}`);
    } catch {
      alert('Failed to change user role');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setUpdating(userId);
    try {
      await adminApi.toggleUserStatus(userId);
      await load();
      alert('User status updated');
    } catch {
      alert('Failed to update user status');
    } finally {
      setUpdating(null);
    }
  };

  const admins = users.filter((u) => u.role === 'ADMIN');
  const customers = users.filter((u) => u.role === 'CUSTOMER');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Total Admins</p>
          <p className="text-2xl font-bold text-white">{admins.length}</p>
          <p className="text-gray-500 text-xs mt-1">Users with admin access</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Total Customers</p>
          <p className="text-2xl font-bold text-white">{customers.length}</p>
          <p className="text-gray-500 text-xs mt-1">Regular user accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search users by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input-base flex-1"
        />
        <span className="text-gray-500 text-sm whitespace-nowrap">{total} users</span>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-center px-4 py-3">Role</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-4 bg-gray-800 rounded" />
                    </td>
                  </tr>
                ))
              : users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800/50 hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.firstName[0]}
                        </div>
                        <span className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'CUSTOMER' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updating === user.id}
                            onClick={() => handleRoleChange(user.id, 'ADMIN')}
                          >
                            {updating === user.id ? '...' : 'Make Admin'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updating === user.id}
                            onClick={() => handleRoleChange(user.id, 'CUSTOMER')}
                          >
                            {updating === user.id ? '...' : 'Demote'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updating === user.id}
                          onClick={() => handleToggleStatus(user.id)}
                          className={user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                        >
                          {updating === user.id ? '...' : user.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-gray-500 text-xs">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ‹ Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next ›
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card p-4 bg-blue-500/5 border border-blue-500/20">
        <p className="text-blue-300 text-sm">
          <strong>ℹ️ How it works:</strong> All users start as customers during signup. Use this page to promote trusted
          customers to admins. Only admins can manage products, categories, and send notifications.
        </p>
      </div>
    </div>
  );
}
