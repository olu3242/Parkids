// PAR-KIDS — Supabase Edge Function: Generate Check-In Summary
// Called after check-in completion to create an AI summary
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { check_in_id } = await req.json();
    if (!check_in_id) throw new Error('check_in_id is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch check-in with responses
    const { data: checkIn } = await supabase
      .from('check_ins')
      .select(`
        id, scheduled_at,
        child:child_user_id (first_name, date_of_birth, child_profiles (age_group, grade)),
        sections:check_in_sections (
          section_key, section_title,
          responses:check_in_responses (question_text, response_value, responded_as)
        )
      `)
      .eq('id', check_in_id)
      .single();

    if (!checkIn) throw new Error('Check-in not found');

    const child = (checkIn as any).child;
    const ageGroup = child?.child_profiles?.[0]?.age_group ?? 'unknown';

    // Build sanitized prompt (no PII to OpenAI)
    const responsesSummary = (checkIn as any).sections
      ?.map((section: any) => {
        const sectionResponses = section.responses
          ?.filter((r: any) => r.response_value)
          ?.map((r: any) => `  - ${r.question_text}: ${r.response_value}`)
          ?.join('\n');
        return sectionResponses ? `${section.section_title}:\n${sectionResponses}` : null;
      })
      ?.filter(Boolean)
      ?.join('\n\n');

    // Call OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 400,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: `You are a warm, supportive family wellbeing assistant for Par-Kids.
Your role is to generate a brief, encouraging summary of a parent-child check-in.
Age group of the child: ${ageGroup}.
Guidelines:
- Write 2-3 short paragraphs in a warm, positive tone
- Highlight strengths and wins first
- Mention any areas of support without being alarming
- End with a forward-looking, encouraging note
- Do NOT use the child's real name — use "your child" instead
- Do NOT reproduce exact quotes from responses
- Keep it under 200 words`
          },
          {
            role: 'user',
            content: `Please summarize this family check-in:\n\n${responsesSummary}`
          }
        ]
      }),
    });

    const aiData = await openAIResponse.json();
    const summaryText = aiData.choices?.[0]?.message?.content ?? 'Summary could not be generated.';

    // Save summary to check-in
    await supabase
      .from('check_ins')
      .update({ summary_text: summaryText, status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', check_in_id);

    // Also save to summary_reports
    await supabase.from('summary_reports').insert({
      household_id: (checkIn as any).household_id,
      child_user_id: (checkIn as any).child_user_id,
      report_type: 'checkin',
      period_start: (checkIn as any).scheduled_at?.split('T')[0],
      period_end: (checkIn as any).scheduled_at?.split('T')[0],
      title: `Check-In Summary — ${new Date((checkIn as any).scheduled_at).toLocaleDateString()}`,
      content: summaryText,
    });

    return new Response(JSON.stringify({ success: true, summary: summaryText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
