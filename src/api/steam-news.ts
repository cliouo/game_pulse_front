import apiClient from './client';
import type { PaginatedResponse, SteamNewsItem } from '@/types';

const steamNewsApi = {
  async getNewsByAppId(appId: number, params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamNewsItem>>('/steam-news/' + appId, { params });
    return response.data;
  },

  async getLatestNews(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<SteamNewsItem>>('/steam-news/latest', { params });
    return response.data;
  },
};

export default steamNewsApi;
