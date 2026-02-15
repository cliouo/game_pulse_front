import { useQuery } from @tanstack/react-query;
import igdbApi from @/api/igdb;

export function useIGDBByAppId(appId: number | null) {
  return useQuery({
    queryKey: [igdb, appId],
    queryFn: () => igdbApi.getByAppId(appId!),
    enabled: appId !== null && appId > 0,
  });
}
