import type { FamilyPoll } from '@/types/voting';

export type UsePollsResult = {
  polls: FamilyPoll[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type CreatePollFormState = {
  submitting: boolean;
  error: string | null;
};
