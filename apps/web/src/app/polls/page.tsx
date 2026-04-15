import PollList from '@/components/PollList';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function PollsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-[#1E2D2F]">Family Polls</h1>
        <p className="text-sm text-[#486668]">
          Parents can create and veto decisions. Parents and children can both vote while a poll is active.
        </p>
      </header>

      <PollList />
    </main>
  );
}
