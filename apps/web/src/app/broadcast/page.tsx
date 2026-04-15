import { redirect } from 'next/navigation';
import BroadcastHubClient from '@/app/broadcast/BroadcastHubClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/profiles';
import { fetchPollsByHousehold } from '@/lib/supabase/queries';
import { FamilyPoll, PollOption, PollVote } from '@/types/voting';

export default async function BroadcastPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await ensureProfile(supabase, user);
  if (!profile?.household_id) redirect('/onboarding');

  const householdId = profile.household_id;

  const { data: pollsData } = await fetchPollsByHousehold(supabase, householdId);

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

  const polls: FamilyPoll[] = (pollsData ?? []).map((poll: any) => ({
    ...poll,
    options: optionsByPoll[poll.id] ?? [],
    votes: votesByPoll[poll.id] ?? [],
  }));

  return (
    <div className="min-h-screen bg-[#FDF6EC] p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-[#1E2D2F]">Broadcast Hub</h1>
          <p className="text-[#486668]">Family voting, parent control, celebrations, and real-world place rewards.</p>
        </header>

        <BroadcastHubClient
          initialPolls={polls}
          householdId={householdId}
          currentUserId={user.id}
          userRole={profile.role ?? 'child'}
        />
      </div>
    </div>
  );
}
