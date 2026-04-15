import Link from 'next/link';
import { Place } from '@/types/voting';

type PlaceCardProps = {
  place: Place;
};

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1E2D2F]">{place.name}</h3>
        {place.is_partner ? (
          <span className="rounded-full bg-[#F0FBF4] px-2 py-1 text-xs font-semibold text-[#2D7D5A]">
            Partner
          </span>
        ) : null}
      </div>
      <p className="text-sm text-[#486668]">{place.category} · {place.city}</p>
      <div className="mt-4">
        <Link
          href={`/places/${place.id}`}
          className="inline-flex rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346]"
        >
          Plan Visit
        </Link>
      </div>
    </article>
  );
}
