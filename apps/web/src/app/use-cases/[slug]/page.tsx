import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getLandingPageData, type LandingUseCase } from '@/lib/landing';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getUseCaseBySlug(slug: string): Promise<LandingUseCase | null> {
  const supabase = await createServerSupabaseClient();
  const data = await getLandingPageData(supabase);
  return data.useCases.find((item) => slugify(item.title) === slug) ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const useCase = await getUseCaseBySlug(slug);

  if (!useCase) {
    return {
      title: 'Use Case | Par-Kids',
      description: 'Family growth use case.',
    };
  }

  const title = `${useCase.title} | Par-Kids Use Case`;
  const description = useCase.description;
  const canonicalPath = `/use-cases/${slug}`;

  return {
    title,
    description,
    keywords: useCase.tags,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalPath}`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  const supabase = await createServerSupabaseClient();
  const data = await getLandingPageData(supabase);
  return data.useCases.map((item) => ({ slug: slugify(item.title) }));
}

export default async function UseCasePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const useCase = await getUseCaseBySlug(slug);

  if (!useCase) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: useCase.title,
    description: useCase.description,
    url: `${siteUrl}/use-cases/${slug}`,
    keywords: useCase.tags.join(', '),
    isPartOf: {
      '@type': 'WebSite',
      name: 'Par-Kids',
      url: siteUrl,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-4xl font-bold text-[#1E2D2F]">{useCase.title}</h1>
      <p className="mt-4 text-lg text-[#486668]">{useCase.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {useCase.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#EAF5EE] px-3 py-1 text-sm font-medium text-[#2D7D5A]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm font-semibold text-[#2D7D5A] hover:underline">
          ← Back to homepage
        </Link>
      </div>
    </main>
  );
}
