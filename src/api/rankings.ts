import apiClient from './client';
import type { ApiResponse, RankingRecord } from '@/types';

const rankingsApi = {
  async getTopSelling(limit?: number) {
    const params = typeof limit === 'number' ? { limit } : undefined;
    const response = await apiClient.get<ApiResponse<RankingRecord[]>>('/steam-rankings/topselling/top', {
      params,
    });
    return response.data;
  },

  async getRecordTimes() {
    const response = await apiClient.get<ApiResponse<string[]>>('/steam-rankings/record-times');
    return response.data;
  },
};

export default rankingsApi;
