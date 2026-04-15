export type PollStatus = 'active' | 'closed' | 'vetoed';

export type Place = {
  id: string;
  name: string;
  category: string;
  city: string;
  lat: number | null;
  lng: number | null;
  is_partner: boolean;
};

export type PollOption = {
  id: string;
  poll_id: string;
  label: string;
  place_id: string | null;
  place?: Place | null;
};

export type PollVote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
};

export type FamilyPoll = {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  starts_at: string;
  ends_at: string;
  closed_at: string | null;
  winning_option_id: string | null;
  final_option_id: string | null;
  vetoed_by: string | null;
  veto_reason: string | null;
  reward_created: boolean;
  options: PollOption[];
  votes: PollVote[];
};

export type PollWithComputed = FamilyPoll & {
  voteMap: Record<string, number>;
  totalVotes: number;
  winningOption?: PollOption | null;
  finalOption?: PollOption | null;
};
