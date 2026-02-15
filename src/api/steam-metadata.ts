import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  SteamTagInfo,
  SteamMostFollowedInfo,
  SteamTopRatedInfo,
  SteamMostWishlistedInfo,
  SteamMostPlayedInfo,
  SteamSaleInfo,
} from '@/types';

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

  async getTopRated(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamTopRatedInfo>>('/steam-metadata/ranking/toprated', { params });
    return response.data;
  },

  async getMostWishlisted(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamMostWishlistedInfo>>('/steam-metadata/ranking/mostwishlisted', { params });
    return response.data;
  },

  async getMostPlayed(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamMostPlayedInfo>>('/steam-metadata/ranking/mostplayed', { params });
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
