'use client';

import { useCallback, useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import type { UsePollsResult } from '@/types/polls';
import type { FamilyPoll, PollOption, PollVote } from '@/types/voting';

function emptyPollResult(error: string | null = null): UsePollsResult {
  return {
    polls: [],
    loading: false,
    error,
    refetch: async () => undefined,
  };
}

export function usePolls(): UsePollsResult {
  const supabase = getClient();
  const { activeHouseholdId } = useUser();
  const [polls, setPolls] = useState<FamilyPoll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!activeHouseholdId) {
      setPolls([]);
      setError('Missing household');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: pollsData, error: pollsError } = await supabase
      .from('family_polls')
      .select('id,household_id,title,description,status,starts_at,ends_at,closed_at,winning_option_id,final_option_id,vetoed_by,veto_reason,reward_created,created_at')
      .eq('household_id', activeHouseholdId)
      .order('created_at', { ascending: false });

    if (pollsError) {
      setError(pollsError.message);
      setPolls([]);
      setLoading(false);
      return;
    }

    const pollIds = (pollsData ?? []).map((poll) => poll.id);
    if (pollIds.length === 0) {
      setPolls([]);
      setLoading(false);
      return;
    }

    const [optionsRes, votesRes] = await Promise.all([
      supabase.from('poll_options').select('id,poll_id,label,place_id').in('poll_id', pollIds),
      supabase.from('poll_votes').select('id,poll_id,option_id,user_id').in('poll_id', pollIds),
    ]);

    if (optionsRes.error || votesRes.error) {
      setError(optionsRes.error?.message ?? votesRes.error?.message ?? 'Failed to load polls');
      setPolls([]);
      setLoading(false);
      return;
    }

    const optionsByPoll = (optionsRes.data ?? []).reduce<Record<string, PollOption[]>>((acc, option) => {
      if (!acc[option.poll_id]) acc[option.poll_id] = [];
      acc[option.poll_id].push(option as PollOption);
      return acc;
    }, {});

    const votesByPoll = (votesRes.data ?? []).reduce<Record<string, PollVote[]>>((acc, vote) => {
      if (!acc[vote.poll_id]) acc[vote.poll_id] = [];
      acc[vote.poll_id].push(vote as PollVote);
      return acc;
    }, {});

    const merged = (pollsData ?? []).map((poll) => ({
      ...(poll as Omit<FamilyPoll, 'options' | 'votes'>),
      options: optionsByPoll[poll.id] ?? [],
      votes: votesByPoll[poll.id] ?? [],
    }));

    setPolls(merged);
    setLoading(false);
  }, [activeHouseholdId, supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!activeHouseholdId) return;

    const channel = supabase
      .channel(`family-polls-${activeHouseholdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_polls' }, () => {
        void refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, () => {
        void refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_options' }, () => {
        void refetch();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeHouseholdId, refetch, supabase]);

  if (!activeHouseholdId) {
    return emptyPollResult('Missing household');
  }

  return { polls, loading, error, refetch };
}

export default usePolls;
