import apiClient from './client';
import type {
  PaginatedResponse,
  PlayerHistoryPoint,
  PriceHistoryPoint,
  FollowerHistoryPoint,
  HistoryQueryParams,
} from '@/types';

const steamHistoryApi = {
  async getPlayerHistory(appId: number, params?: HistoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<PlayerHistoryPoint>>(
      `/steam-history/players/${appId}`,
      {
        params,
      },
    );
    return response.data;
  },

  async getPriceHistory(appId: number, params?: HistoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<PriceHistoryPoint>>(
      `/steam-history/prices/${appId}`,
      {
        params,
      },
    );
    return response.data;
  },

  async getFollowerHistory(appId: number, params?: HistoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<FollowerHistoryPoint>>(
      `/steam-history/followers/${appId}`,
      {
        params,
      },
    );
    return response.data;
  },
};

export default steamHistoryApi;
