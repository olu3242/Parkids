import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/profiles';

export default async function ChildPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile, error } = await ensureProfile(supabase, user);

  if (error || !profile) {
    redirect('/login');
  }

  if (!profile.household_id) {
    redirect('/onboarding');
  }

  if (profile.role !== 'child') {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#FDF6EC] px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-[#2D7D5A]">Child Home</p>
          <h1 className="mt-2 text-3xl font-bold text-[#1E2D2F]">Welcome back</h1>
          <p className="mt-3 text-[#486668]">
            Vote in family polls, follow rewards, and keep an eye on what your family picks next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/broadcast"
              className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346]"
            >
              View Family Polls
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E2D2F]">What you can do</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#486668]">
              <li>Vote on active family polls</li>
              <li>See when a parent finalizes the decision</li>
              <li>Track rewards and chosen places</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E2D2F]">Protected controls</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#486668]">
              <li>Create poll: parent only</li>
              <li>Invite family members: parent only</li>
              <li>Veto and finalize decisions: parent only</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
