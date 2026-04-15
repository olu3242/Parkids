import type { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLandingPageData } from '@/lib/landing';

export const dynamic = 'force-dynamic';
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const data = await getLandingPageData(supabase);
  const title = 'Par-Kids | Family Growth Platform';
  const description = `Guided family check-ins, shared goals, and decisions with parent veto. ${data.faqs.length} FAQs and ${data.pricingPlans.length} plans available.`;

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'Par-Kids',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const data = await getLandingPageData(supabase);
  const firstPlan = data.pricingPlans[0];

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Par-Kids',
    description: 'Family Growth Platform for check-ins, goal tracking, voting, and parent-guided decisions.',
    brand: { '@type': 'Brand', name: 'Par-Kids' },
    url: siteUrl,
    offers: firstPlan
      ? {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: (firstPlan.price_monthly_cents / 100).toFixed(2),
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/pricing`,
        }
      : undefined,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {data.faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <LandingPageClient
        metric={data.metric}
        pricingPlans={data.pricingPlans}
        faqs={data.faqs}
        useCases={data.useCases}
        galleryItems={data.galleryItems}
      />
    </>
  );
}
