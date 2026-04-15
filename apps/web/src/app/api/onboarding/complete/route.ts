import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

export interface OnboardingPayload {
  familyName: string;
  children: { name: string; emoji: string }[];
}

export async function POST(req: NextRequest) {
  // --- Auth gate ---
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Parse + validate body ---
  let payload: OnboardingPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { familyName, children } = payload;
  if (!familyName?.trim()) {
    return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
  }
  if (!Array.isArray(children) || children.length === 0) {
    return NextResponse.json({ error: 'At least one child is required' }, { status: 400 });
  }
  for (const child of children) {
    if (!child.name?.trim()) {
      return NextResponse.json({ error: 'Each child must have a name' }, { status: 400 });
    }
  }

  // Use service role so we bypass RLS for cross-table inserts
  const admin = createAdminClient();

  try {
    // 1. Ensure parent exists in public.users (upsert by id)
    const { error: upsertUserErr } = await admin.from('users').upsert(
      {
        id: user.id,
        email: user.email ?? null,
        first_name: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Parent',
        last_name: user.user_metadata?.last_name ?? null,
        role: 'parent',
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );
    if (upsertUserErr) throw new Error(`users upsert: ${upsertUserErr.message}`);

    // 2. Check if already onboarded (idempotency guard)
    const { data: existingMembership } = await admin
      .from('household_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (existingMembership) {
      return NextResponse.json({ alreadyOnboarded: true }, { status: 200 });
    }

    // 3. Create household
    const { data: household, error: householdErr } = await admin
      .from('households')
      .insert({
        name: familyName.trim(),
        primary_user_id: user.id,
      })
      .select('id')
      .single();
    if (householdErr || !household) throw new Error(`households insert: ${householdErr?.message}`);

    const householdId = household.id;

    // 4. Add parent to household_members
    const { error: parentMemberErr } = await admin.from('household_members').insert({
      household_id: householdId,
      user_id: user.id,
      role: 'parent',
      access_level: 'full',
      invite_accepted_at: new Date().toISOString(),
      is_active: true,
    });
    if (parentMemberErr) throw new Error(`parent household_member: ${parentMemberErr.message}`);

    // 5. Sync auth-backed profile routing data
    const { error: authProfileErr } = await admin.from('profiles').upsert(
      {
        auth_user_id: user.id,
        email: user.email ?? null,
        household_id: householdId,
      },
      { onConflict: 'auth_user_id' }
    );
    if (authProfileErr) throw new Error(`profiles upsert: ${authProfileErr.message}`);

    const { error: parentMembershipErr } = await admin.from('memberships').upsert(
      {
        user_id: user.id,
        household_id: householdId,
        role: 'parent',
      },
      { onConflict: 'user_id,household_id' }
    );
    if (parentMembershipErr) throw new Error(`memberships parent upsert: ${parentMembershipErr.message}`);

    // 6. Create or upsert parent_profile, marking onboarding complete
    const { error: profileErr } = await admin.from('parent_profiles').upsert(
      {
        user_id: user.id,
        onboarding_completed: true,
        onboarding_step: 4,
      },
      { onConflict: 'user_id' }
    );
    if (profileErr) throw new Error(`parent_profiles upsert: ${profileErr.message}`);

    // 7. Create each child
    for (const child of children) {
      const { data: childUser, error: childUserErr } = await admin
        .from('users')
        .insert({
          first_name: child.name.trim(),
          role: 'child',
          // no email — child accounts are managed by parent
        })
        .select('id')
        .single();
      if (childUserErr || !childUser) throw new Error(`child user insert: ${childUserErr?.message}`);

      const childId = childUser.id;

      // child_profiles
      const { error: childProfileErr } = await admin.from('child_profiles').insert({
        user_id: childId,
        avatar_url: child.emoji,
        avatar_color: '#3ABFBF',
      });
      if (childProfileErr) throw new Error(`child_profiles insert: ${childProfileErr.message}`);

      // household_members
      const { error: childMemberErr } = await admin.from('household_members').insert({
        household_id: householdId,
        user_id: childId,
        role: 'child',
        access_level: 'view_only',
        is_active: true,
      });
      if (childMemberErr) throw new Error(`child household_member: ${childMemberErr.message}`);

      const { error: childMembershipErr } = await admin.from('memberships').upsert(
        {
          user_id: childId,
          household_id: householdId,
          role: 'child',
        },
        { onConflict: 'user_id,household_id' }
      );
      if (childMembershipErr) throw new Error(`memberships child upsert: ${childMembershipErr.message}`);

      // parent_child_relationships
      const { error: pcrErr } = await admin.from('parent_child_relationships').insert({
        parent_user_id: user.id,
        child_user_id: childId,
        household_id: householdId,
        relationship_type: 'parent',
        is_primary: true,
      });
      if (pcrErr) throw new Error(`parent_child_relationships insert: ${pcrErr.message}`);
    }

    return NextResponse.json({ success: true, householdId }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[onboarding/complete]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
