import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type PlacePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaceDetailsPage({ params }: PlacePageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: place } = await supabase
    .from('places')
    .select('id,name,category,city,lat,lng,is_partner')
    .eq('id', id)
    .single();

  if (!place) return notFound();

  return (
    <div className="min-h-screen bg-[#FDF6EC] p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2D2F]">{place.name}</h1>
          <p className="mt-2 text-[#486668]">{place.category} · {place.city}</p>
        </div>

        <dl className="grid gap-4 rounded-2xl bg-[#F7FAFB] p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#486668]">Category</dt>
            <dd className="mt-1 text-[#1E2D2F]">{place.category}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#486668]">Location</dt>
            <dd className="mt-1 text-[#1E2D2F]">{place.city}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#486668]">Latitude</dt>
            <dd className="mt-1 text-[#1E2D2F]">{place.lat ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#486668]">Longitude</dt>
            <dd className="mt-1 text-[#1E2D2F]">{place.lng ?? 'N/A'}</dd>
          </div>
        </dl>

        <button className="rounded-xl bg-[#2D7D5A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#236346]">
          Plan Visit
        </button>
      </div>
    </div>
  );
}
