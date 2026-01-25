import { useQuery } from '@tanstack/react-query';
import publisherApi from '@/api/publisher';
import type { PotentialGamesQueryParams } from '@/types';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: publisherApi.getDashboardStats,
  });
}

export function usePotentialGames(params: PotentialGamesQueryParams) {
  return useQuery({
    queryKey: ['potential-games', params],
    queryFn: () => publisherApi.getPotentialGames(params),
  });
}

export function useMarketOpportunities() {
  return useQuery({
    queryKey: ['market-opportunities'],
    queryFn: publisherApi.getMarketOpportunities,
  });
}

export function useGameTrends(appId: number) {
  return useQuery({
    queryKey: ['game-trends', appId],
    queryFn: () => publisherApi.getGameTrends(appId),
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['publisher-recommendations'],
    queryFn: publisherApi.getRecommendations,
  });
}
