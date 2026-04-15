import type { ThemeMode } from '@/components/theme-provider';

type CreateVotePayload = {
  householdId: string;
  title: string;
  description: string;
  options: Array<{ label: string; place_id: string | null }>;
};

type CastVotePayload = {
  pollId: string;
  optionId: string;
};

type VetoVotePayload = {
  pollId: string;
  optionId: string;
  reason?: string;
};

type AwardPointsPayload = {
  childUserId: string;
  amount: number;
  reason: string;
  pollId?: string;
};

async function parseResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body as any).error ?? 'Request failed');
  }
  return body;
}

export async function createVote(payload: CreateVotePayload) {
  const response = await fetch('/api/polls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function castVote(payload: CastVotePayload) {
  const response = await fetch(`/api/polls/${payload.pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId: payload.optionId }),
  });
  return parseResponse(response);
}

export async function vetoVote(payload: VetoVotePayload) {
  const response = await fetch(`/api/polls/${payload.pollId}/veto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId: payload.optionId, reason: payload.reason }),
  });
  return parseResponse(response);
}

export async function awardPoints(payload: AwardPointsPayload) {
  const response = await fetch('/api/points/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateTheme(theme: ThemeMode) {
  const response = await fetch('/api/profile/theme', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme }),
  });
  return parseResponse(response);
}
