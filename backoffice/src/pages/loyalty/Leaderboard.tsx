import { useEffect, useState } from 'react';
import { loyaltyApi } from '../../services/api';
import { LeaderboardEntry } from '../../types';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loyaltyApi.leaderboard()
      .then((r) => setEntries(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  const tiers = [
    { label: 'Diamond', min: 5000, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Gold', min: 2000, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Silver', min: 500, color: 'text-gray-300', bg: 'bg-gray-400/10' },
    { label: 'Bronze', min: 0, color: 'text-amber-700', bg: 'bg-amber-700/10' },
  ];

  const getTier = (pts: number) => tiers.find((t) => pts >= t.min) ?? tiers[3];

  return (
    <div className="space-y-6">
      {/* Tier key */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiers.map((t) => (
          <div key={t.label} className={`card p-3 text-center ${t.bg} border-transparent`}>
            <p className={`font-bold text-sm ${t.color}`}>{t.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{t.min.toLocaleString()}+ pts</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Top Clients — All Time</h3>
          <p className="text-gray-500 text-xs mt-0.5">{entries.length} ranked customers</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-center px-4 py-3 w-16">Rank</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-center px-4 py-3">Tier</th>
              <th className="text-right px-4 py-3">Points</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                    <td className="px-4 py-3" colSpan={4}><div className="h-4 bg-gray-800 rounded" /></td>
                  </tr>
                ))
              : entries.map((entry) => {
                  const tier = getTier(entry.totalPoints);
                  return (
                    <tr key={entry.userId} className="border-b border-gray-800/50 hover:bg-surface-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-center">
                        {medals[entry.rank]
                          ? <span className="text-xl">{medals[entry.rank]}</span>
                          : <span className="text-gray-400 font-bold">#{entry.rank}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {entry.firstName[0]}
                          </div>
                          <span className="text-white font-medium">{entry.firstName} {entry.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tier.bg} ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-primary font-bold text-base">
                          {entry.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-gray-600 text-xs ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {entries.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-white font-medium">No ranking data yet</p>
            <p className="text-gray-500 text-sm mt-1">Points will appear here after customers make purchases</p>
          </div>
        )}
      </div>
    </div>
  );
}
