import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LoyaltyScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { loyaltyApi } from '../../services/api';
import { LeaderboardEntry, LoyaltyTransaction } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Colors } from '../../theme/colors';
import { Typography, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius, Shadow } from '../../theme/spacing';

export default function LoyaltyScreen({ navigation }: LoyaltyScreenProps) {
  const { user } = useAuthStore();
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'history' | 'leaderboard'>('leaderboard');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pts, txns, lb] = await Promise.all([
        loyaltyApi.getMyPoints(),
        loyaltyApi.getTransactions(),
        loyaltyApi.getLeaderboard(),
      ]);
      setPoints(pts.data.data.totalPoints);
      setTransactions(txns.data.data);
      setLeaderboard(lb.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Cargando datos de lealtad…" />;

  const myRank = leaderboard.findIndex((e) => e.userId === user?.id) + 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* ── Points Hero ───────────────────── */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={Colors.gradientHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.starIcon}>
              <Ionicons name="star" size={28} color={Colors.white} />
            </View>
            <Text style={styles.heroLabel}>Tus puntos</Text>
            <Text style={styles.heroPoints}>{points.toLocaleString()}</Text>
            <Text style={styles.heroPts}>PTS</Text>
            {myRank > 0 && (
              <View style={styles.rankBadge}>
                <Ionicons name="trophy" size={14} color={Colors.primary} />
                <Text style={styles.rankText}>Posición #{myRank}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* ── Tier Info ─────────────────────── */}
        <View style={styles.tierSection}>
          <TierCard currentPoints={points} />
        </View>

        {/* ── Tabs ──────────────────────────── */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'leaderboard' && styles.tabActive]}
            onPress={() => setTab('leaderboard')}
          >
            <Text style={[styles.tabLabel, tab === 'leaderboard' && styles.tabLabelActive]}>
              Clasificación
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'history' && styles.tabActive]}
            onPress={() => setTab('history')}
          >
            <Text style={[styles.tabLabel, tab === 'history' && styles.tabLabelActive]}>
              Mi historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Content ───────────────────────── */}
        {tab === 'leaderboard' ? (
          <View style={styles.content}>
            {leaderboard.map((entry) => (
              <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === user?.id} />
            ))}
          </View>
        ) : (
          <View style={styles.content}>
            {transactions.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="star-outline" size={48} color={Colors.textMuted} />
                <Text style={[Typography.bodySmall, { marginTop: Spacing.md, textAlign: 'center' }]}>
                  Sin transacciones aún. ¡Realiza tu primera compra para ganar puntos!
                </Text>
              </View>
            ) : (
              transactions.map((txn) => <TransactionRow key={txn.id} txn={txn} />)
            )}
          </View>
        )}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TierCard({ currentPoints }: { currentPoints: number }) {
  const tiers = [
    { name: 'Bronze', min: 0, max: 499, color: '#CD7F32' },
    { name: 'Silver', min: 500, max: 1999, color: '#C0C0C0' },
    { name: 'Gold', min: 2000, max: 4999, color: '#FFD700' },
    { name: 'Diamond', min: 5000, max: Infinity, color: '#E8448A' },
  ];
  const current = tiers.find((t) => currentPoints >= t.min && currentPoints <= t.max) ?? tiers[0];
  const next = tiers[tiers.indexOf(current) + 1];
  const progress = next ? (currentPoints - current.min) / (next.min - current.min) : 1;

  return (
    <View style={tierStyles.card}>
      <View style={tierStyles.left}>
        <Ionicons name="trophy" size={20} color={current.color} />
        <Text style={[tierStyles.tier, { color: current.color }]}>{current.name}</Text>
      </View>
      {next && (
        <View style={tierStyles.right}>
          <Text style={tierStyles.nextLabel}>{next.min - currentPoints} pts para {next.name}</Text>
          <View style={tierStyles.progressBg}>
            <View style={[tierStyles.progressFill, { width: `${progress * 100}%`, backgroundColor: current.color }]} />
          </View>
        </View>
      )}
    </View>
  );
}

function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
  return (
    <View style={[lbStyles.row, isMe && lbStyles.rowMe]}>
      <Text style={lbStyles.rank}>{medal ?? `#${entry.rank}`}</Text>
      <View style={lbStyles.avatar}>
        {entry.avatar ? (
          <Image source={{ uri: entry.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
        ) : (
          <LinearGradient colors={Colors.gradientPrimary} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>
              {entry.firstName[0]}
            </Text>
          </LinearGradient>
        )}
      </View>
      <Text style={[lbStyles.name, isMe && { color: Colors.primary }]}>
        {entry.firstName} {entry.lastName}{isMe ? ' (Tú)' : ''}
      </Text>
      <Text style={lbStyles.pts}>{entry.totalPoints.toLocaleString()} pts</Text>
    </View>
  );
}

function TransactionRow({ txn }: { txn: LoyaltyTransaction }) {
  const positive = txn.points > 0;
  return (
    <View style={txStyles.row}>
      <View style={[txStyles.icon, { backgroundColor: positive ? Colors.successSoft : Colors.errorSoft }]}>
        <Ionicons
          name={positive ? 'add-circle' : 'remove-circle'}
          size={20}
          color={positive ? Colors.success : Colors.error}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={txStyles.reason}>{txn.reason}</Text>
        <Text style={txStyles.date}>{new Date(txn.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={[txStyles.pts, { color: positive ? Colors.success : Colors.error }]}>
        {positive ? '+' : ''}{txn.points} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backBtn: {
    marginLeft: Spacing.screen,
    marginTop: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: { paddingHorizontal: Spacing.screen, marginTop: Spacing.base },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.pink,
  },
  starIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  heroPoints: { fontSize: 56, fontWeight: '900', color: Colors.white, letterSpacing: -2, lineHeight: 64 },
  heroPts: { fontSize: FontSize.sm, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    marginTop: Spacing.base,
  },
  rankText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  tierSection: { paddingHorizontal: Spacing.screen, marginTop: Spacing.lg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.card },
  tabLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textTertiary },
  tabLabelActive: { color: Colors.textPrimary },
  content: { paddingHorizontal: Spacing.screen, marginTop: Spacing.base, gap: Spacing.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
});

const tierStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    gap: Spacing.base,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tier: { fontSize: FontSize.base, fontWeight: '700' },
  right: { flex: 1, gap: 4 },
  nextLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  progressBg: { height: 6, backgroundColor: Colors.surface, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});

const lbStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
  },
  rowMe: { borderWidth: 1.5, borderColor: Colors.primaryBorder, backgroundColor: Colors.primarySoft },
  rank: { width: 32, textAlign: 'center', fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  avatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  name: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  pts: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
});

const txStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.base },
  icon: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  reason: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary },
  date: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  pts: { fontSize: FontSize.base, fontWeight: '700' },
});
