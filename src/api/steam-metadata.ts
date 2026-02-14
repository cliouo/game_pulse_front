import apiClient from './client';
import type { ApiResponse, PaginatedResponse, SteamTagInfo, SteamMostFollowedInfo, SteamSaleInfo } from '@/types';

const steamMetadataApi = {
  async getGameTags(appId: number) {
    const response = await apiClient.get<ApiResponse<SteamTagInfo[]>>(`/steam-metadata/tags/${appId}`);
    return response.data;
  },

  async getMostFollowed(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamMostFollowedInfo>>('/steam-metadata/ranking/mostfollowed', {
      params,
    });
    return response.data;
  },

  async getCurrentSales(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamSaleInfo>>('/steam-metadata/sales', {
      params,
    });
    return response.data;
  },
};

export default steamMetadataApi;
