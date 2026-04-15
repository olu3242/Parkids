export type WaitlistPayload = {
  email: string;
  role: 'parent' | 'child';
  children_count: number;
  biggest_challenge: string;
};

export type ParentSurveyPayload = {
  waitlist_id?: string | null;
  email?: string | null;
  frequency_of_conversations: string;
  biggest_challenges: string;
  emotional_openness: number;
  willingness_to_use_tool: number;
  willingness_to_pay: string;
};

export type ChildSurveyPayload = {
  waitlist_id?: string | null;
  communication_comfort: number;
  motivation_preferences: string;
  rewards_interest: number;
};

async function parseResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body as any).error ?? 'Request failed');
  }
  return body;
}

export async function submitWaitlist(payload: WaitlistPayload) {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function submitParentSurvey(payload: ParentSurveyPayload) {
  const response = await fetch('/api/surveys/parent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function submitChildSurvey(payload: ChildSurveyPayload) {
  const response = await fetch('/api/surveys/child', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
