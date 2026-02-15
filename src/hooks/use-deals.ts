import { useQuery } from @tanstack/react-query;
import dealsApi from @/api/deals;

export function useDealsByAppId(appId: number | null, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: [deals, appId, page, pageSize],
    queryFn: () => dealsApi.getByAppId(appId!, { page, page_size: pageSize }),
    enabled: appId !== null && appId > 0,
  });
}

export function useBestDeals(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: [deals-best, page, pageSize],
    queryFn: () => dealsApi.getBestDeals({ page, page_size: pageSize }),
  });
}
