import { redirect } from 'next/navigation';
import InsightsClient from '@/app/insights/InsightsClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/profiles';

export default async function InsightsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await ensureProfile(supabase, user);

  if (!profile?.household_id) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-[#D8DDE3] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1E2D2F]">Family Insights</h1>
          <p className="mt-2 text-[#486668]">Join a household to view live analytics.</p>
        </div>
      </div>
    );
  }

  if (profile.role !== 'parent') {
    redirect('/child');
  }

  const householdId = profile.household_id;

  return (
    <div className="min-h-screen bg-[#FDF6EC] p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-[#1E2D2F]">Advanced Insights Dashboard</h1>
          <p className="text-[#486668]">Realtime poll, vote, and reward analytics for your household.</p>
        </header>

        <InsightsClient householdId={householdId} />
      </div>
    </div>
  );
}
