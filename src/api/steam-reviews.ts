import apiClient from './client';
import type { PaginatedResponse, SteamReviewItem } from '@/types';

const steamReviewsApi = {
  async getByAppId(appId: number, params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamReviewItem>>('/steam-reviews/' + appId, { params });
    return response.data;
  },
};

export default steamReviewsApi;
