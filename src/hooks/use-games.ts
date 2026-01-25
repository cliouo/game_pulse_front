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
