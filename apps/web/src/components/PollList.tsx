'use client';

import { useCallback, useState } from 'react';
import CreatePollForm from '@/components/CreatePollForm';
import PollCard from '@/components/PollCard';
import usePolls from '@/hooks/usePolls';
import { castVote, vetoVote } from '@/lib/api/actions';
import { getClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

export default function PollList() {
  const supabase = getClient();
  const { user, role, isLoading: isUserLoading } = useUser();
  const { polls, loading, error, refetch } = usePolls();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      setActionError(null);
      try {
        await castVote({ pollId, optionId });
        await refetch();
      } catch (voteError) {
        setActionError(voteError instanceof Error ? voteError.message : 'Unable to cast vote.');
      }
    },
    [refetch]
  );

  const handleVeto = useCallback(
    async (pollId: string, optionId: string, reason?: string) => {
      setActionError(null);
      try {
        await vetoVote({ pollId, optionId, reason });
        await refetch();
      } catch (vetoError) {
        setActionError(vetoError instanceof Error ? vetoError.message : 'Unable to veto this poll.');
      }
    },
    [refetch]
  );

  const handleExpire = useCallback(
    async () => {
      await supabase.rpc('close_expired_polls');
      await refetch();
    },
    [refetch, supabase]
  );

  if (isUserLoading || loading) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-6 text-sm text-[#486668]">
        Loading polls...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-6 text-sm text-[#486668]">
        Sign in to view household polls.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreatePollForm onCreated={refetch} />
      {actionError ? (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {actionError}
        </div>
      ) : null}
      {polls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-[#1E2D2F]">No active polls yet</h3>
          <p className="mt-2 text-sm text-[#486668]">
            {role === 'parent'
              ? 'Create the first poll to start family voting.'
              : 'A parent can create the first poll for your household.'}
          </p>
        </div>
      ) : (
        polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            currentUserId={user.id}
            canVeto={role === 'parent'}
            isParent={role === 'parent'}
            onVote={handleVote}
            onVeto={handleVeto}
            onExpire={handleExpire}
          />
        ))
      )}
    </div>
  );
}
