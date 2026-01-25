import { useQuery } from '@tanstack/react-query';
import statsApi from '@/api/stats';

export function useTopPlayers(limit?: number) {
  return useQuery({
    queryKey: ['stats-top-players', limit],
    queryFn: () => statsApi.getTopPlayers(limit),
  });
}

export function useTopReviews(limit?: number) {
  return useQuery({
    queryKey: ['stats-top-reviews', limit],
    queryFn: () => statsApi.getTopReviews(limit),
  });
}
