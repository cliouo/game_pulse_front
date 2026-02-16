import apiClient from './client';
import type { ApiResponse, IGDBGameInfo } from '@/types';

const igdbApi = {
  async getByAppId(appId: number) {
    const response = await apiClient.get<ApiResponse<IGDBGameInfo>>('/igdb/' + appId);
    return response.data;
  },
};

export default igdbApi;
