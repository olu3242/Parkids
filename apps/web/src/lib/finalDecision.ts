import { FamilyPoll, PollOption } from '@/types/voting';

export function getWinningOptionByVotes(poll: FamilyPoll): PollOption | null {
  if (poll.options.length === 0) return null;

  const voteCountByOption = poll.votes.reduce<Record<string, number>>((acc, vote) => {
    acc[vote.option_id] = (acc[vote.option_id] ?? 0) + 1;
    return acc;
  }, {});

  return poll.options.reduce<PollOption | null>((best, current) => {
    if (!best) return current;
    const bestVotes = voteCountByOption[best.id] ?? 0;
    const currentVotes = voteCountByOption[current.id] ?? 0;
    return currentVotes > bestVotes ? current : best;
  }, null);
}

export function getFinalDecision(poll: FamilyPoll): PollOption | null {
  if (poll.status === 'vetoed' && poll.final_option_id) {
    return poll.options.find((opt) => opt.id === poll.final_option_id) ?? null;
  }

  return getWinningOptionByVotes(poll);
}
