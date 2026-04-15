import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLandingPageData } from '@/lib/landing';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const data = await getLandingPageData(supabase);
  return NextResponse.json(data);
}
