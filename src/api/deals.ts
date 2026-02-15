import apiClient from ./client;
import type { GameDealInfo, PaginatedResponse } from @/types;

const dealsApi = {
  async getByAppId(appId: number, params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<GameDealInfo>>(/deals/ + appId, { params });
    return response.data;
  },

  async getBestDeals(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<GameDealInfo>>(/deals/best, { params });
    return response.data;
  },
};

export default dealsApi;
