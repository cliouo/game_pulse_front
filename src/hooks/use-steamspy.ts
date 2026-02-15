import { useQuery } from '@tanstack/react-query';
import steamSpyApi from '@/api/steam-spy';

export function useSteamSpyByAppId(appId: number | null, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steamspy', appId, page, pageSize],
    queryFn: () => steamSpyApi.getByAppId(appId!, { page, page_size: pageSize }),
    enabled: appId !== null && appId > 0,
  });
}

export function useSteamSpyTopByOwners(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steamspy-top-owners', page, pageSize],
    queryFn: () => steamSpyApi.getTopByOwners({ page, page_size: pageSize }),
  });
}
