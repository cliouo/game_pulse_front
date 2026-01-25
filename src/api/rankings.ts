import apiClient from './client';
import type { ApiResponse, RankingRecord } from '@/types';

const rankingsApi = {
  async getTopSelling(limit?: number) {
    const params = typeof limit === 'number' ? { limit } : undefined;
    const response = await apiClient.get<ApiResponse<RankingRecord[]>>('/rankings/top-selling', {
      params,
    });
    return response.data;
  },

  async getTopWishlist(limit?: number) {
    const params = typeof limit === 'number' ? { limit } : undefined;
    const response = await apiClient.get<ApiResponse<RankingRecord[]>>('/rankings/top-wishlist', {
      params,
    });
    return response.data;
  },

  async getRecordTimes() {
    const response = await apiClient.get<ApiResponse<string[]>>('/rankings/record-times');
    return response.data;
  },
};

export default rankingsApi;
