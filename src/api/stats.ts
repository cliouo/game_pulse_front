import apiClient from './client';
import type { ApiResponse, TopGameInfo } from '@/types';

const statsApi = {
  async getTopPlayers(limit?: number) {
    const params = typeof limit === 'number' ? { limit } : undefined;
    const response = await apiClient.get<ApiResponse<TopGameInfo[]>>('/stats/top-players', {
      params,
    });
    return response.data;
  },

  async getTopReviews(limit?: number) {
    const params = typeof limit === 'number' ? { limit } : undefined;
    const response = await apiClient.get<ApiResponse<TopGameInfo[]>>('/stats/top-reviews', {
      params,
    });
    return response.data;
  },
};

export default statsApi;
