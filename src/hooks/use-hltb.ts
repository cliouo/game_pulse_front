import { useQuery } from @tanstack/react-query;
import hltbApi from @/api/hltb;

export function useHLTBByAppId(appId: number | null) {
  return useQuery({
    queryKey: [hltb, appId],
    queryFn: () => hltbApi.getByAppId(appId!),
    enabled: appId !== null && appId > 0,
  });
}
