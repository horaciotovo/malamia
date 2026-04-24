import { useEffect, useState } from 'react';
import { customersApi } from '../../services/api';
import { User } from '../../types';
import Button from '../../components/ui/Button';

export default function CustomerList() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { load(); }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await customersApi.list({ page, limit, search: search || undefined });
      setCustomers(data.data.data);
      setTotal(data.data.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base w-64"
          />
          <span className="text-gray-500 text-sm">{total} customers</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-right px-4 py-3">Points</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                    <td className="px-4 py-3" colSpan={6}><div className="h-4 bg-gray-800 rounded" /></td>
                  </tr>
                ))
              : customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/50 hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.firstName[0]}
                        </div>
                        <span className="text-white font-medium">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{c.email}</td>
                    <td className="px-4 py-3 text-gray-400">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-primary font-bold">{(c.loyaltyPoints ?? 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</Button>
              <Button variant="ghost" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>Next ›</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
