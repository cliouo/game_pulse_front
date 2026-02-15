import { useQuery } from '@tanstack/react-query';
import steamHistoryApi from '@/api/steam-history';
import type { HistoryQueryParams } from '@/types';

export function usePlayerHistory(appId: number | null, params?: HistoryQueryParams) {
  return useQuery({
    queryKey: ['steam-history-players', appId, params],
    queryFn: () => steamHistoryApi.getPlayerHistory(appId!, params),
    enabled: appId !== null && appId > 0,
  });
}

export function usePriceHistory(appId: number | null, params?: HistoryQueryParams) {
  return useQuery({
    queryKey: ['steam-history-prices', appId, params],
    queryFn: () => steamHistoryApi.getPriceHistory(appId!, params),
    enabled: appId !== null && appId > 0,
  });
}

export function useFollowerHistory(appId: number | null, params?: HistoryQueryParams) {
  return useQuery({
    queryKey: ['steam-history-followers', appId, params],
    queryFn: () => steamHistoryApi.getFollowerHistory(appId!, params),
    enabled: appId !== null && appId > 0,
  });
}
