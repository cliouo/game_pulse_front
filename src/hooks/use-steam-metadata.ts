import { useQuery } from '@tanstack/react-query';
import steamMetadataApi from '@/api/steam-metadata';

export function useGameTags(appId: number | null) {
  return useQuery({
    queryKey: ['steam-metadata-tags', appId],
    queryFn: () => steamMetadataApi.getGameTags(appId!),
    enabled: appId !== null && appId > 0,
  });
}

export function useMostFollowed(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-metadata-most-followed', page, pageSize],
    queryFn: () => steamMetadataApi.getMostFollowed({ page, page_size: pageSize }),
  });
}

export function useTopRated(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-metadata-top-rated', page, pageSize],
    queryFn: () => steamMetadataApi.getTopRated({ page, page_size: pageSize }),
  });
}

export function useMostWishlisted(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-metadata-most-wishlisted', page, pageSize],
    queryFn: () => steamMetadataApi.getMostWishlisted({ page, page_size: pageSize }),
  });
}

export function useMostPlayed(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-metadata-most-played', page, pageSize],
    queryFn: () => steamMetadataApi.getMostPlayed({ page, page_size: pageSize }),
  });
}

export function useCurrentSales(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['steam-metadata-sales', page, pageSize],
    queryFn: () => steamMetadataApi.getCurrentSales({ page, page_size: pageSize }),
  });
}
