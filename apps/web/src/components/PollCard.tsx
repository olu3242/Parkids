'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import DashboardCard from '@/components/DashboardCard';
import ResultsChart from '@/components/ResultsChart';
import VoteButton from '@/components/VoteButton';
import { getFinalDecision, getWinningOptionByVotes } from '@/lib/finalDecision';
import { FamilyPoll } from '@/types/voting';

type PollCardProps = {
  poll: FamilyPoll;
  currentUserId: string;
  canVeto: boolean;
  isParent: boolean;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  onExpire: (pollId: string) => Promise<void>;
  onVeto: (pollId: string, optionId: string, reason?: string) => Promise<void>;
};

function getStatusBadge(status: FamilyPoll['status']) {
  if (status === 'active') return 'bg-[#F0FBF4] text-[#2D7D5A]';
  if (status === 'vetoed') return 'bg-[#FFF1E8] text-[#A94442]';
  return 'bg-[#EEF7FF] text-[#245B83]';
}

export default function PollCard({
  poll,
  currentUserId,
  canVeto,
  isParent,
  onVote,
  onExpire,
  onVeto,
}: PollCardProps) {
  const [vetoReason, setVetoReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const voteMap = poll.options.reduce<Record<string, number>>((acc, option) => {
    acc[option.id] = poll.votes.filter((vote) => vote.option_id === option.id).length;
    return acc;
  }, {});

  const totalVotes = poll.votes.length;
  const myVote = poll.votes.find((vote) => vote.user_id === currentUserId)?.option_id;
  const revealResults = poll.status !== 'active' || new Date(poll.ends_at).getTime() <= Date.now();
  const votingLocked = poll.status !== 'active' || Boolean(myVote);

  const winningOption = getWinningOptionByVotes(poll);
  const finalOption = getFinalDecision(poll);
  const chartData = poll.options.map((option) => ({ label: option.label, value: voteMap[option.id] ?? 0 }));

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <DashboardCard
        title={poll.title}
        subtitle={poll.description ?? 'Family activity vote'}
        action={
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(poll.status)}`}>
              {poll.status.toUpperCase()}
            </span>
            <CountdownTimer targetTime={poll.ends_at} onExpire={() => onExpire(poll.id)} />
          </div>
        }
      >
        <div className="space-y-3">
          {poll.options.map((option) => (
            <VoteButton
              key={option.id}
              label={option.label}
              selected={myVote === option.id}
              disabled={votingLocked}
              onClick={async () => {
                try {
                  setActionError(null);
                  await onVote(poll.id, option.id);
                } catch (error: any) {
                  setActionError(error?.message ?? 'Unable to cast vote');
                }
              }}
            />
          ))}
        </div>

        {actionError ? (
          <p className="mt-3 text-xs text-[#A94442]">{actionError}</p>
        ) : null}

        <p className="mt-4 text-xs text-[#486668]">{totalVotes} total votes</p>

        {poll.status === 'vetoed' ? (
          <div className="mt-4 rounded-xl bg-[#FFF1E8] p-3 text-sm text-[#A94442]">
            Decision finalized by parent.
          </div>
        ) : null}

        {!isParent && myVote ? (
          <div className="mt-4 rounded-xl bg-[#F0FBF4] p-3 text-sm text-[#2D7D5A]">
            Your vote is in. Results unlock when the family decision is finalized.
          </div>
        ) : null}

        {!revealResults ? (
          <div className="mt-4 rounded-xl bg-[#FDF6EC] p-3 text-sm text-[#486668]">
            {isParent
              ? 'Results stay hidden until the 48-hour timer ends or you finalize the decision.'
              : 'Results stay hidden until the 48-hour timer ends or the parent finalizes the decision.'}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 space-y-4"
          >
            <ResultsChart data={chartData} mode="bar" valueLabel="Votes" />

            <div className="rounded-xl bg-[#F0FBF4] p-3 text-sm text-[#1E2D2F]">
              <p>
                <span className="font-semibold">Original winner:</span>{' '}
                {winningOption?.label ?? 'No winner yet'}
              </p>
              <p>
                <span className="font-semibold">Final decision:</span>{' '}
                {finalOption?.label ?? winningOption?.label ?? 'Pending'}
              </p>
              {poll.status === 'vetoed' ? (
                <p className="mt-2 text-[#7A3D32]">
                  Parent selected an alternative to better fit family needs.
                  {poll.veto_reason ? ` Reason: ${poll.veto_reason}` : ''}
                </p>
              ) : null}
            </div>

            {canVeto && (poll.status === 'active' || poll.status === 'closed') ? (
              <div className="rounded-xl border border-[#FFD8C2] bg-[#FFF6F1] p-3">
                <p className="mb-2 text-sm font-semibold text-[#A94442]">Parent veto control</p>
                <input
                  value={vetoReason}
                  onChange={(e) => setVetoReason(e.target.value)}
                  placeholder="Optional reason, e.g. better timing"
                  className="mb-3 w-full rounded-lg border border-[#E9B89C] bg-white px-3 py-2 text-xs text-[#1E2D2F]"
                />
                <div className="flex flex-wrap gap-2">
                  {poll.options.map((option) => (
                    <button
                      key={`veto-${option.id}`}
                      onClick={async () => {
                        try {
                          setActionError(null);
                          await onVeto(poll.id, option.id, vetoReason || undefined);
                        } catch (error: any) {
                          setActionError(error?.message ?? 'Unable to finalize decision');
                        }
                      }}
                      className="rounded-lg border border-[#E9B89C] px-3 py-1 text-xs font-semibold text-[#7A3D32] hover:bg-[#FFEADB]"
                    >
                      Set final: {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </DashboardCard>
    </motion.div>
  );
}
