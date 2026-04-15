// PAR-KIDS — Edge Function: Daily Mood Alert Check
// Runs daily via Supabase cron, checks for persistent low moods
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find children who logged mood ≤ 2 three times in the last 21 days
  const { data: lowMoodChildren } = await supabase.rpc('find_low_mood_patterns', {
    threshold: 2,
    min_count: 3,
    days_back: 21
  });

  for (const child of (lowMoodChildren ?? [])) {
    // Check if we already sent alert in last 7 days
    const { data: recentAlert } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', child.parent_user_id)
      .eq('type', 'mood_alert')
      .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (recentAlert && recentAlert.length > 0) continue;

    // Create notification for parent
    await supabase.from('notifications').insert({
      user_id: child.parent_user_id,
      type: 'mood_alert',
      title: 'Wellbeing Check-In Suggested',
      body: `Your child has been logging lower moods recently. A check-in conversation might be helpful.`,
      data: { child_user_id: child.child_user_id },
    });
  }

  return new Response(JSON.stringify({ processed: (lowMoodChildren ?? []).length }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
