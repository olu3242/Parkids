import type { SupabaseClient } from '@supabase/supabase-js';

export interface LandingMetric {
  checkin_completion_pct: number;
  goals_completed_count: number;
  mood_trend_label: string;
}

export interface LandingPricingPlan {
  id: string;
  slug: string;
  name: string;
  price_monthly_cents: number;
  period_label: string;
  description: string | null;
  is_featured: boolean;
  feature_list: string[];
  limit_note: string | null;
  cta_label: string;
  sort_order: number;
}

export interface LandingFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface LandingUseCase {
  id: string;
  title: string;
  description: string;
  tags: string[];
  sort_order: number;
}

export interface LandingGalleryItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string | null;
  color_token: string;
  sort_order: number;
}

export interface LandingPageData {
  metric: LandingMetric;
  pricingPlans: LandingPricingPlan[];
  faqs: LandingFaq[];
  useCases: LandingUseCase[];
  galleryItems: LandingGalleryItem[];
}

export async function getLandingPageData(supabase: SupabaseClient): Promise<LandingPageData> {
  const [metricRes, pricingRes, faqRes, useCaseRes, galleryRes] = await Promise.all([
    supabase
      .from('landing_metrics')
      .select('checkin_completion_pct, goals_completed_count, mood_trend_label')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('landing_pricing_plans')
      .select('id, slug, name, price_monthly_cents, period_label, description, is_featured, feature_list, limit_note, cta_label, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('landing_faqs')
      .select('id, question, answer, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('landing_use_cases')
      .select('id, title, description, tags, sort_order')
      .order('sort_order', { ascending: true }),
    supabase
      .from('landing_gallery_items')
      .select('id, icon, title, subtitle, color_token, sort_order')
      .order('sort_order', { ascending: true }),
  ]);

  const safeMetricRaw = metricRes.data as Partial<LandingMetric> | null;
  const safeMetric: LandingMetric = safeMetricRaw
    ? {
        checkin_completion_pct: Number(safeMetricRaw.checkin_completion_pct ?? 87),
        goals_completed_count: Number(safeMetricRaw.goals_completed_count ?? 12),
        mood_trend_label: String(safeMetricRaw.mood_trend_label ?? 'Stable'),
      }
    : {
      checkin_completion_pct: 87,
      goals_completed_count: 12,
      mood_trend_label: 'Stable',
    };

  const safePricingPlans: LandingPricingPlan[] = ((pricingRes.data as LandingPricingPlan[] | null) ?? []).map(
    (plan) => ({
      ...plan,
      feature_list: Array.isArray(plan.feature_list) ? plan.feature_list.map((item) => String(item)) : [],
      price_monthly_cents: Number(plan.price_monthly_cents ?? 0),
      cta_label: String(plan.cta_label ?? 'Get Started'),
      name: String(plan.name ?? 'Plan'),
    })
  );

  const safeFaqs: LandingFaq[] = ((faqRes.data as LandingFaq[] | null) ?? []).map((faq) => ({
    ...faq,
    question: String(faq.question ?? ''),
    answer: String(faq.answer ?? ''),
  }));

  const safeUseCases: LandingUseCase[] = ((useCaseRes.data as LandingUseCase[] | null) ?? []).map((item) => ({
    ...item,
    title: String(item.title ?? ''),
    description: String(item.description ?? ''),
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
  }));

  const safeGalleryItems: LandingGalleryItem[] = ((galleryRes.data as LandingGalleryItem[] | null) ?? []).map(
    (item) => ({
      ...item,
      icon: String(item.icon ?? '✨'),
      title: String(item.title ?? ''),
      color_token: String(item.color_token ?? 'sage'),
    })
  );

  return {
    metric: safeMetric,
    pricingPlans: safePricingPlans,
    faqs: safeFaqs,
    useCases: safeUseCases,
    galleryItems: safeGalleryItems,
  };
}
