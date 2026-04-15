'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import KPIWidget from '@/components/KPIWidget';
import DashboardCard from '@/components/DashboardCard';
import { supabase } from '@/lib/supabase';

const InsightsCharts = dynamic(() => import('@/components/InsightsCharts'), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-[#EEF2F3]" />,
});

type Vote = { option_id: string; created_at: string };
type PollOption = { id: string; label: string };

type AnalyticsSnapshot = {
  totals: {
    polls: number;
    votes: number;
    rewards: number;
  };
  voteDistribution: { label: string; value: number }[];
  voteTrends: { label: string; value: number }[];
};

type InsightsClientProps = {
  householdId: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export default function InsightsClient({ householdId }: InsightsClientProps) {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>({
    totals: { polls: 0, votes: 0, rewards: 0 },
    voteDistribution: [],
    voteTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setError(null);

    const timeframeDays = timeframe === 'weekly' ? 7 : 30;
    const cutoffDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).toISOString();

    const [pollCountRes, voteCountRes, rewardCountRes, optionsRes, votesRes] = await Promise.all([
      supabase
        .from('family_polls')
        .select('*', { count: 'exact', head: true })
        .eq('household_id', householdId),
      supabase
        .from('poll_votes')
        .select('id, family_polls!inner(household_id)', { count: 'exact', head: true })
        .eq('family_polls.household_id', householdId),
      supabase
        .from('rewards')
        .select('*', { count: 'exact', head: true })
        .eq('household_id', householdId),
      supabase
        .from('poll_options')
        .select('id,label,poll_id,family_polls!inner(household_id)')
        .eq('family_polls.household_id', householdId),
      supabase
        .from('poll_votes')
        .select('option_id,created_at,poll_id,family_polls!inner(household_id)')
        .eq('family_polls.household_id', householdId)
        .gte('created_at', cutoffDate),
    ]);

    if (pollCountRes.error || voteCountRes.error || rewardCountRes.error || optionsRes.error || votesRes.error) {
      throw new Error(
        pollCountRes.error?.message ||
          voteCountRes.error?.message ||
          rewardCountRes.error?.message ||
          optionsRes.error?.message ||
          votesRes.error?.message ||
          'Failed to load analytics'
      );
    }

    const options = (optionsRes.data ?? []) as PollOption[];
    const votes = (votesRes.data ?? []) as Vote[];

    const labelByOptionId = options.reduce<Record<string, string>>((acc, option) => {
      acc[option.id] = option.label;
      return acc;
    }, {});

    const voteDistributionMap = votes.reduce<Record<string, number>>((acc, vote) => {
      const label = labelByOptionId[vote.option_id] ?? 'Unknown Option';
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    const voteDistribution = Object.entries(voteDistributionMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const voteTrendMap = votes.reduce<Record<string, number>>((acc, vote) => {
      const d = new Date(vote.created_at);
      const label = timeframe === 'weekly'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    const voteTrends = Object.entries(voteTrendMap).map(([label, value]) => ({ label, value }));

    setSnapshot({
      totals: {
        polls: pollCountRes.count ?? 0,
        votes: voteCountRes.count ?? 0,
        rewards: rewardCountRes.count ?? 0,
      },
      voteDistribution,
      voteTrends,
    });
  }, [householdId, timeframe]);

  const scheduleRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAnalytics().catch((err) => setError(err.message ?? 'Failed to refresh analytics'));
    }, 300);
  }, [fetchAnalytics]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    fetchAnalytics()
      .catch((err) => {
        if (isMounted) setError(err.message ?? 'Failed to load analytics');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const channel = supabase
      .channel(`insights-${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_polls' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards' }, scheduleRefresh)
      .subscribe();

    return () => {
      isMounted = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchAnalytics, householdId, scheduleRefresh]);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics()
      .catch((err) => setError(err.message ?? 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [fetchAnalytics]);

  const hasAnyData = useMemo(
    () =>
      snapshot.totals.polls > 0 || snapshot.totals.votes > 0 || snapshot.totals.rewards > 0,
    [snapshot]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'weekly' | 'monthly')}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {error ? (
        <DashboardCard title="Analytics Unavailable" subtitle="Network or permissions error">
          <div className="space-y-3">
            <p className="text-sm text-[#A94442]">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchAnalytics()
                  .catch((err) => setError(err.message ?? 'Failed to load analytics'))
                  .finally(() => setLoading(false));
              }}
              className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346]"
            >
              Retry
            </button>
          </div>
        </DashboardCard>
      ) : null}

      {!error && !loading && !hasAnyData ? (
        <DashboardCard title="No Analytics Yet" subtitle="Start engaging the family to generate metrics">
          <p className="text-sm text-[#486668]">
            Create polls, cast votes, and finalize rewards to see live analytics here.
          </p>
        </DashboardCard>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-2xl bg-[#EEF2F3]" />
          ))
        ) : (
          <>
            <KPIWidget
              label="Total polls created"
              value={formatNumber(snapshot.totals.polls)}
              delta="Exact count"
              positive
            />
            <KPIWidget
              label="Total votes cast"
              value={formatNumber(snapshot.totals.votes)}
              delta="Live updates"
              positive
            />
            <KPIWidget
              label="Total rewards generated"
              value={formatNumber(snapshot.totals.rewards)}
              delta="Milestones unlocked"
              positive
            />
          </>
        )}
      </section>

      <InsightsCharts
        voteDistribution={snapshot.voteDistribution}
        voteTrends={snapshot.voteTrends}
        loading={loading}
      />

      <div className="text-xs text-[#6B8485]">
        Realtime listens to poll votes, polls, and rewards. Refreshes are debounced for performance.
      </div>
    </div>
  );
}
