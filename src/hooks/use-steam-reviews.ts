import { useQuery } from '@tanstack/react-query';
import steamReviewsApi from '@/api/steam-reviews';

export function useSteamReviewsByAppId(appId: number | null, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-reviews', appId, page, pageSize],
    queryFn: () => steamReviewsApi.getByAppId(appId!, { page, page_size: pageSize }),
    enabled: appId !== null && appId > 0,
  });
}
