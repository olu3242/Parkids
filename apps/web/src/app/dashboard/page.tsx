import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ensureProfile } from '@/lib/auth/profiles';
import InviteButton from '@/components/dashboard/InviteButton';
import ActiveHouseholdSwitcher from '@/components/dashboard/ActiveHouseholdSwitcher';
import { fetchHouseholdMembers } from '@/lib/supabase/queries';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await ensureProfile(supabase, user);
  if (!profile) redirect('/login');
  if (profile?.role === 'child') redirect('/child');
  if (!profile.household_id) redirect('/onboarding');

  // Guard: send new users to onboarding if no household
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();
  if (!membership) redirect('/onboarding');

  const { data: memberRows } = await fetchHouseholdMembers(supabase, profile.household_id);

  const { data: upcomingCheckIns } = await supabase
    .from('check_ins')
    .select('*, users:child_user_id (first_name)')
    .eq('parent_user_id', user.id)
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_at', { ascending: true })
    .limit(1);

  const members = (memberRows ?? []).map((row: any) => ({
    role: row.role,
    user: row.users,
  })).filter((row: any) => Boolean(row.user));
  const parents = members.filter((m: any) => m.role === 'parent').map((m: any) => m.user);
  const children = members.filter((m: any) => m.role === 'child').map((m: any) => m.user);
  const nextCheckIn = upcomingCheckIns?.[0];

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-[#2D7D5A]">Par-Kids</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[['🏠','Dashboard','/dashboard',true],['👤','Children','/dashboard/children',false],['✅','Check-Ins','/dashboard/check-ins',false],['📊','Growth','/dashboard/growth',false],['🗳️','Polls','/polls',false],['📣','Broadcast','/broadcast',false],['💡','Insights','/insights',false],['⚙️','Settings','/dashboard/settings',false],['💳','Billing','/pricing',false]].map(([icon,label,href,active]: any) => (
            <a key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-[#F0FBF4] text-[#2D7D5A]' : 'text-[#486668] hover:bg-gray-50'}`}>
              <span>{icon}</span>{label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="ml-64 p-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1E2D2F]">Good morning! 👋</h1>
              <p className="text-[#486668] mt-1">Here is how your family is doing this week.</p>
            </div>
            <a href="/check-in/new" className="bg-[#2D7D5A] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#236346] transition-colors">
              + Start Check-In
            </a>
          </div>

          <ActiveHouseholdSwitcher />
          <InviteButton />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1E2D2F] mb-3">Parents</h3>
              <div className="space-y-2">
                {parents.length === 0 ? (
                  <p className="text-xs text-[#486668]">No parent members yet.</p>
                ) : (
                  parents.map((parent: any) => (
                    <div key={parent.id} className="text-sm text-[#486668]">
                      {parent.first_name} {parent.last_name ?? ''}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1E2D2F] mb-3">Children</h3>
              <div className="space-y-2">
                {children.length === 0 ? (
                  <p className="text-xs text-[#486668]">No child members yet.</p>
                ) : (
                  children.map((child: any) => (
                    <div key={child.id} className="text-sm text-[#486668]">
                      {child.child_profiles?.[0]?.nickname ?? child.first_name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {nextCheckIn && (
            <div className="bg-gradient-to-r from-[#2D7D5A] to-[#3ABFBF] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Upcoming Check-In</p>
                  <h2 className="text-xl font-bold">Check-in with {(nextCheckIn as any).users?.first_name}</h2>
                  <p className="text-green-100 text-sm mt-1">{new Date((nextCheckIn as any).scheduled_at).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
                </div>
                <a href={`/check-in/${(nextCheckIn as any).id}`} className="bg-white text-[#2D7D5A] px-5 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-colors">Start Now</a>
              </div>
            </div>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1E2D2F]">Your Children</h2>
              <a href="/dashboard/children/add" className="text-sm text-[#2D7D5A] font-medium hover:underline">+ Add Child</a>
            </div>
            {children.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">👶</div>
                <h3 className="font-semibold text-[#1E2D2F] mb-2">Add your first child</h3>
                <p className="text-[#486668] text-sm mb-4">Create a profile to start tracking their growth</p>
                <a href="/dashboard/children/add" className="inline-block bg-[#2D7D5A] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#236346] transition-colors">Add Child Profile</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child: any) => (
                  <a key={child.id} href={`/dashboard/children/${child.id}`} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{backgroundColor: child.child_profiles?.[0]?.avatar_color ?? '#3ABFBF'}}>
                        {child.first_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1E2D2F] group-hover:text-[#2D7D5A] transition-colors">{child.child_profiles?.[0]?.nickname ?? child.first_name}</h3>
                        <p className="text-xs text-[#486668]">{child.child_profiles?.[0]?.grade ?? 'Grade not set'}</p>
                      </div>
                    </div>
                    <div className="text-xs text-[#486668]">
                      Member data synced from household records.
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
