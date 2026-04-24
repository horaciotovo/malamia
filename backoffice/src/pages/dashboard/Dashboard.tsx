import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { DashboardStats } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MOCK_REVENUE = [
  { month: 'Jan', revenue: 1200 }, { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 1400 }, { month: 'Apr', revenue: 2200 },
  { month: 'May', revenue: 1900 }, { month: 'Jun', revenue: 2800 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Products', value: stats?.totalProducts ?? '—', icon: '🛍️', sub: `${stats?.publishedProducts ?? 0} published` },
    { label: 'Customers', value: stats?.totalCustomers ?? '—', icon: '👥', sub: 'Active accounts' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: '📦', sub: 'All time' },
    { label: 'Revenue', value: stats ? `$${stats.totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}` : '—', icon: '💰', sub: 'Total earnings', highlight: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`card p-5 ${kpi.highlight ? 'border-primary/30 bg-primary/5' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                  {kpi.label}
                </p>
                <p className={`text-2xl font-bold ${kpi.highlight ? 'text-primary' : 'text-white'}`}>
                  {loading ? <span className="animate-pulse text-gray-600">—</span> : kpi.value}
                </p>
                <p className="text-gray-500 text-xs mt-1">{kpi.sub}</p>
              </div>
              <span className="text-2xl">{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_REVENUE} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8, color: '#fff' }}
                formatter={(v: number) => [`$${v}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#E8448A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Orders</h3>
            <Link to="/customers" className="text-primary text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {loading
              ? [1, 2, 3].map((k) => (
                  <div key={k} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-800" />
                    <div className="flex-1 h-3 bg-gray-800 rounded" />
                  </div>
                ))
              : stats?.recentOrders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-xs font-bold">${Number(order.totalAmount).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status as keyof typeof statusColors] ?? ''}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                )) ?? <p className="text-gray-500 text-sm">No orders yet</p>
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/products/new" className="btn-primary text-sm">+ Add Product</Link>
          <Link to="/notifications" className="btn-ghost border border-gray-700 text-sm rounded-lg px-4 py-2.5">Send Notification</Link>
          <Link to="/loyalty" className="btn-ghost border border-gray-700 text-sm rounded-lg px-4 py-2.5">View Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}

const statusColors = {
  DELIVERED: 'bg-green-500/10 text-green-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  SHIPPED: 'bg-blue-500/10 text-blue-400',
  CONFIRMED: 'bg-primary/10 text-primary',
  PENDING: 'bg-gray-700 text-gray-400',
};
