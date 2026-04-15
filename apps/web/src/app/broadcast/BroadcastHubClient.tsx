'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CelebrationModal from '@/components/CelebrationModal';
import CreatePollModal from '@/components/CreatePollModal';
import PollCard from '@/components/PollCard';
import PlaceCard from '@/components/PlaceCard';
import { supabase } from '@/lib/supabase';
import { castVote, createVote, vetoVote } from '@/lib/api/actions';
import { useUser } from '@/hooks/useUser';
import { FamilyPoll, PollOption, Place, PollVote } from '@/types/voting';

type BroadcastHubClientProps = {
  initialPolls: FamilyPoll[];
  householdId: string;
  currentUserId: string;
  userRole: string;
};

export default function BroadcastHubClient({
  initialPolls,
  householdId,
  currentUserId,
  userRole,
}: BroadcastHubClientProps) {
  const { activeHouseholdId } = useUser();
  const effectiveHouseholdId = activeHouseholdId ?? householdId;
  const [polls, setPolls] = useState<FamilyPoll[]>(initialPolls);
  const [places, setPlaces] = useState<Place[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationPlace, setCelebrationPlace] = useState<Place | null>(null);
  const [modalTitle, setModalTitle] = useState('Reward Unlocked!');
  const [modalDescription, setModalDescription] = useState('Your family completed the vote and unlocked a new real-world activity.');
  const [modalCtaLabel, setModalCtaLabel] = useState('View Place');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollIdsRef = useRef<Set<string>>(new Set(initialPolls.map((poll) => poll.id)));
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCelebrationRef = useRef<string | null>(null);
  const lastRefreshAtRef = useRef<number>(0);

  const activePlaces = useMemo(() => {
    const places: Place[] = [];
    polls.forEach((poll) => {
      poll.options.forEach((option) => {
        if (option.place && !places.some((p) => p.id === option.place!.id)) {
          places.push(option.place);
        }
      });
    });
    return places;
  }, [polls]);

  const refreshAllPolls = useCallback(async () => {
    lastRefreshAtRef.current = Date.now();
    if (!effectiveHouseholdId) return;
    setIsLoading(true);
    setErrorMessage(null);

    const { data: pollsData } = await supabase
      .from('family_polls')
      .select('id,household_id,title,description,status,starts_at,ends_at,closed_at,winning_option_id,final_option_id,vetoed_by,veto_reason,reward_created')
      .eq('household_id', effectiveHouseholdId)
      .order('created_at', { ascending: false });

    const pollIds = (pollsData ?? []).map((poll) => poll.id);

    const { data: optionsData } = await supabase
      .from('poll_options')
      .select('id,poll_id,label,place_id, places(id,name,category,city,lat,lng,is_partner)')
      .in('poll_id', pollIds.length > 0 ? pollIds : ['00000000-0000-0000-0000-000000000000']);

    const { data: votesData } = await supabase
      .from('poll_votes')
      .select('id,poll_id,option_id,user_id')
      .in('poll_id', pollIds.length > 0 ? pollIds : ['00000000-0000-0000-0000-000000000000']);

    const optionsByPoll = (optionsData ?? []).reduce<Record<string, PollOption[]>>((acc, option: any) => {
      if (!acc[option.poll_id]) acc[option.poll_id] = [];
      acc[option.poll_id].push({
        id: option.id,
        poll_id: option.poll_id,
        label: option.label,
        place_id: option.place_id,
        place: option.places ?? null,
      });
      return acc;
    }, {});

    const votesByPoll = (votesData ?? []).reduce<Record<string, PollVote[]>>((acc, vote: any) => {
      if (!acc[vote.poll_id]) acc[vote.poll_id] = [];
      acc[vote.poll_id].push(vote);
      return acc;
    }, {});

    const nextPolls: FamilyPoll[] = (pollsData ?? []).map((poll: any) => ({
      ...poll,
      options: optionsByPoll[poll.id] ?? [],
      votes: votesByPoll[poll.id] ?? [],
    }));

    pollIdsRef.current = new Set(nextPolls.map((poll) => poll.id));
    setPolls(nextPolls);
    setIsLoading(false);
  }, [effectiveHouseholdId]);

  const scheduleRefresh = useCallback(() => {
    if (Date.now() - lastRefreshAtRef.current < 180) return;
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      void refreshAllPolls();
    }, 120);
  }, [refreshAllPolls]);

  const closeExpiredPolls = useCallback(async () => {
    await supabase.rpc('close_expired_polls');
    await refreshAllPolls();
  }, [refreshAllPolls]);

  const handleVote = useCallback(async (pollId: string, optionId: string) => {
    setErrorMessage(null);

    setPolls((prev) => prev.map((poll) => {
      if (poll.id !== pollId) return poll;
      const withoutExisting = poll.votes.filter((vote) => vote.user_id !== currentUserId);
      const optimisticVote: PollVote = {
        id: `optimistic-${pollId}-${currentUserId}`,
        poll_id: pollId,
        option_id: optionId,
        user_id: currentUserId,
      };
      return { ...poll, votes: [...withoutExisting, optimisticVote] };
    }));

    try {
      await castVote({ pollId, optionId });
      await refreshAllPolls();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to cast vote.');
      await refreshAllPolls();
    }
  }, [currentUserId, refreshAllPolls]);

  const handleExpire = useCallback(async () => {
    await closeExpiredPolls();
  }, [closeExpiredPolls]);

  const handleVeto = useCallback(async (pollId: string, optionId: string, reason?: string) => {
    setErrorMessage(null);
    try {
      await vetoVote({ pollId, optionId, reason });
      await refreshAllPolls();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to veto this poll.');
    }
  }, [refreshAllPolls]);

  const handleCreatePoll = useCallback(async (payload: {
    title: string;
    description: string;
    options: Array<{ label: string; place_id: string | null }>;
  }) => {
    setErrorMessage(null);
    if (!effectiveHouseholdId) {
      setErrorMessage('Missing household context.');
      return;
    }
    try {
      await createVote({ ...payload, householdId: effectiveHouseholdId });
      await refreshAllPolls();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create poll.');
    }
  }, [effectiveHouseholdId, refreshAllPolls]);

  useEffect(() => {
    const loadPlaces = async () => {
      const { data } = await supabase
        .from('places')
        .select('id,name,category,city,lat,lng,is_partner')
        .order('name', { ascending: true });

      setPlaces((data ?? []) as Place[]);
    };

    loadPlaces();
  }, []);

  useEffect(() => {
    refreshAllPolls();
  }, [refreshAllPolls]);

  useEffect(() => {
    if (!effectiveHouseholdId) return;

    const voteChannel = supabase.channel(`poll-votes-${effectiveHouseholdId}`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'poll_votes' },
      (payload) => {
        const nextVote = payload.new as { poll_id?: string } | null;
        const oldVote = payload.old as { poll_id?: string } | null;
        const votePollId = nextVote?.poll_id ?? oldVote?.poll_id ?? null;
        if (!votePollId || !pollIdsRef.current.has(votePollId)) return;
        scheduleRefresh();
      }
    ).subscribe();

    const pollChannel = supabase
      .channel(`poll-status-${effectiveHouseholdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_polls', filter: `household_id=eq.${effectiveHouseholdId}` },
        (payload) => {
          if (payload.eventType !== 'UPDATE') {
            scheduleRefresh();
            return;
          }
          const next = payload.new as Partial<FamilyPoll> & { id: string };
          setPolls((prev) => {
            const current = prev.find((poll) => poll.id === next.id);
            const updated = prev.map((poll) => (poll.id === next.id ? { ...poll, ...next } : poll));

            const becameFinal = (next.status === 'closed' || next.status === 'vetoed') && next.final_option_id;
            if (becameFinal && current) {
              const celebrationKey = `${next.id}:${next.status}:${next.final_option_id}`;
              if (lastCelebrationRef.current === celebrationKey) {
                return updated;
              }
              lastCelebrationRef.current = celebrationKey;
              const place = current.options.find((o) => o.id === next.final_option_id)?.place ?? null;
              setCelebrationPlace(place);
              if (next.status === 'vetoed') {
                setModalTitle('Decision finalized by parent');
                setModalDescription('Voting is now locked. The parent has finalized the family decision.');
                setModalCtaLabel('View Place');
              } else {
                setModalTitle('Reward Unlocked!');
                setModalDescription('Your family completed the vote and unlocked a new real-world activity.');
                setModalCtaLabel('View Place');
              }
              setCelebrationOpen(true);
            }

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      supabase.removeChannel(voteChannel);
      supabase.removeChannel(pollChannel);
    };
  }, [effectiveHouseholdId, scheduleRefresh]);

  return (
    <div className="space-y-8">
      {errorMessage ? (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-6 text-sm text-[#486668]">
          Loading household polls...
        </div>
      ) : null}

      {userRole === 'parent' ? (
        <div className="flex justify-end">
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346]"
          >
            + Create Poll
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {polls.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-8 text-center">
              <h3 className="text-lg font-semibold text-[#1E2D2F]">No active polls yet</h3>
              <p className="mt-2 text-sm text-[#486668]">
                {userRole === 'parent'
                  ? 'Create your first family vote to start shared decisions and unlock rewards.'
                  : 'A parent can create the first poll to start family voting.'}
              </p>
              {userRole === 'parent' ? (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346]"
                >
                  Create First Poll
                </button>
              ) : null}
            </div>
          ) : (
            polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                currentUserId={currentUserId}
                canVeto={userRole === 'parent'}
                onVote={handleVote}
                onExpire={() => handleExpire()}
                onVeto={handleVeto}
                isParent={userRole === 'parent'}
              />
            ))
          )}
        </div>

        <aside className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1E2D2F]">City Explorer</h2>
          <p className="text-sm text-[#486668]">Pick from real-world places linked to your family votes.</p>
          {activePlaces.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-4 text-sm text-[#486668]">
              No places mapped yet. Add place-linked options to unlock rewards.
            </div>
          ) : (
            activePlaces.map((place) => <PlaceCard key={place.id} place={place} />)
          )}
        </aside>
      </div>

      <CelebrationModal
        open={celebrationOpen}
        place={celebrationPlace}
        onClose={() => setCelebrationOpen(false)}
        title={modalTitle}
        description={modalDescription}
        ctaLabel={modalCtaLabel}
      />

      <CreatePollModal
        open={createOpen}
        places={places}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreatePoll}
      />
    </div>
  );
}
