import { useQuery } from '@tanstack/react-query';
import rankingsApi from '@/api/rankings';

export function useTopSelling(limit?: number) {
  return useQuery({
    queryKey: ['rankings-top-selling', limit],
    queryFn: () => rankingsApi.getTopSelling(limit),
  });
}


export function useRecordTimes() {
  return useQuery({
    queryKey: ['rankings-record-times'],
    queryFn: rankingsApi.getRecordTimes,
  });
}
