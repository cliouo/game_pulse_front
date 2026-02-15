import apiClient from './client';
import type { PaginatedResponse, SteamSpyInfo } from '@/types';

const steamSpyApi = {
  async getByAppId(appId: number, params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamSpyInfo>>('/steamspy/' + appId, { params });
    return response.data;
  },

  async getTopByOwners(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamSpyInfo>>('/steamspy/top-owners', { params });
    return response.data;
  },
};

export default steamSpyApi;
