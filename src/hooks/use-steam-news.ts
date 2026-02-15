import { useQuery } from '@tanstack/react-query';
import steamNewsApi from '@/api/steam-news';

export function useNewsByAppId(appId: number | null, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-news', appId, page, pageSize],
    queryFn: () => steamNewsApi.getNewsByAppId(appId!, { page, page_size: pageSize }),
    enabled: appId !== null && appId > 0,
  });
}

export function useLatestNews(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-news-latest', page, pageSize],
    queryFn: () => steamNewsApi.getLatestNews({ page, page_size: pageSize }),
  });
}
