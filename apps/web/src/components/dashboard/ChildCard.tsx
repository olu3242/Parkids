'use client';
// ============================================================
// PAR-KIDS — ChildCard Component
// Displays a child's summary card on the parent dashboard
// ============================================================
import Link from 'next/link';
import { ChevronRight, Target, Smile } from 'lucide-react';
import { moodEmojis, moodColors } from '@parkids/ui-tokens';

interface ChildCardProps {
  child: {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    date_of_birth?: string;
    child_profiles?: {
      grade?: string;
      avatar_color?: string;
      age_group?: string;
      nickname?: string;
    }[];
    latest_mood?: number;
    active_goals?: number;
    last_checkin?: string;
  };
}

function getAgeFromDob(dob?: string): number | null {
  if (!dob) return null;
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  return age;
}

export function ChildCard({ child }: ChildCardProps) {
  const profile = child.child_profiles?.[0];
  const age = getAgeFromDob(child.date_of_birth);
  const displayName = profile?.nickname ?? child.first_name;
  const avatarColor = profile?.avatar_color ?? '#3ABFBF';
  const moodLevel = child.latest_mood ?? null;

  return (
    <Link
      href={`/dashboard/children/${child.id}`}
      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-sand-200 hover:border-green-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {child.avatar_url ? (
              <img
                src={child.avatar_url}
                alt={displayName}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              displayName[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-800 text-lg leading-tight">
              {displayName}
            </h3>
            <p className="text-sm text-charcoal-400">
              {age ? `Age ${age}` : ''}
              {profile?.grade ? ` · ${profile.grade}` : ''}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-charcoal-300 group-hover:text-green-500 transition-colors mt-1" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mood */}
        <div className="bg-sand-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Smile className="w-3.5 h-3.5 text-charcoal-400" />
            <span className="text-xs text-charcoal-400 font-medium">Last Mood</span>
          </div>
          {moodLevel ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{moodEmojis[moodLevel as keyof typeof moodEmojis]}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: moodColors[moodLevel] }}
              >
                {['', 'Low', 'Low', 'Okay', 'Good', 'Great'][moodLevel]}
              </span>
            </div>
          ) : (
            <span className="text-sm text-charcoal-300">No data yet</span>
          )}
        </div>

        {/* Goals */}
        <div className="bg-sand-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-charcoal-400" />
            <span className="text-xs text-charcoal-400 font-medium">Active Goals</span>
          </div>
          <span className="text-lg font-bold text-charcoal-800">
            {child.active_goals ?? 0}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-sand-100">
        <span className="text-sm font-medium text-green-500 group-hover:text-green-600 transition-colors">
          Start Check-In →
        </span>
      </div>
    </Link>
  );
}
