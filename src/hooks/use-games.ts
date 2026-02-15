import { useQuery } from '@tanstack/react-query';
import gamesApi from '@/api/games';
import type { GamesQueryParams } from '@/types';

export function useGames(params: GamesQueryParams) {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => gamesApi.getGames(params),
  });
}

export function useGameSearch(keyword: string) {
  return useQuery({
    queryKey: ['games-search', keyword],
    queryFn: () => gamesApi.searchGames(keyword),
    enabled: keyword.trim().length > 0,
  });
}

export function useGameById(id: number) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.getGameById(id),
  });
}

export function useGameDetail(id: number | null) {
  return useQuery({
    queryKey: ['game-detail', id],
    queryFn: () => gamesApi.getGameDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useLatestStats(appId: number | null) {
  return useQuery({
    queryKey: ['latest-stats', appId],
    queryFn: () => gamesApi.getLatestStatsByAppId(appId!),
    enabled: appId !== null && appId > 0,
  });
}
