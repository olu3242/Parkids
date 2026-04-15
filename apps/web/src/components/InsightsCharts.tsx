'use client';

import DashboardCard from '@/components/DashboardCard';
import ResultsChart from '@/components/ResultsChart';

type ChartPoint = { label: string; value: number };

type InsightsChartsProps = {
  voteDistribution: ChartPoint[];
  voteTrends: ChartPoint[];
  loading?: boolean;
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#D8DDE3] bg-[#F8FAFB] p-6 text-sm text-[#486668]">
      {message}
    </div>
  );
}

export default function InsightsCharts({ voteDistribution, voteTrends, loading = false }: InsightsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardCard title="Vote Distribution" subtitle="Votes per option across selected timeframe">
        {loading ? (
          <div className="h-72 animate-pulse rounded-2xl bg-[#EEF2F3]" />
        ) : voteDistribution.length === 0 ? (
          <EmptyState message="No vote data yet. Create a poll and cast votes to see distribution." />
        ) : (
          <ResultsChart data={voteDistribution} mode="bar" valueLabel="Votes" />
        )}
      </DashboardCard>

      <DashboardCard title="Activity Trend" subtitle="Votes cast over time">
        {loading ? (
          <div className="h-72 animate-pulse rounded-2xl bg-[#EEF2F3]" />
        ) : voteTrends.length === 0 ? (
          <EmptyState message="No activity trend available yet." />
        ) : (
          <ResultsChart data={voteTrends} mode="line" valueLabel="Votes" />
        )}
      </DashboardCard>
    </div>
  );
}
