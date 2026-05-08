import apiClient from './client';
import type {
  ApiResponse,
  GamesQueryParams,
  GameWithStats,
  PaginatedResponse,
  GameDetail,
  StatsDetail,
} from '@/types';

const gamesApi = {
  async getGames(params: GamesQueryParams) {
    const response = await apiClient.get<PaginatedResponse<GameWithStats>>('/games', {
      params,
    });
    return response.data;
  },

  async searchGames(keyword: string, signal?: AbortSignal) {
    const response = await apiClient.get<ApiResponse<GameWithStats[]>>('/games/search', {
      params: { keyword },
      signal,
    });
    return response.data;
  },

  async getGameById(id: number) {
    const response = await apiClient.get<ApiResponse<GameWithStats>>(`/games/${id}`);
    return response.data;
  },

  async getGameDetail(id: number) {
    const response = await apiClient.get<ApiResponse<GameDetail>>(`/games/${id}`);
    return response.data;
  },

  async getGameByAppId(appId: number) {
    const response = await apiClient.get<ApiResponse<GameDetail>>(`/games/app/${appId}`);
    return response.data;
  },

  async getLatestStatsByAppId(appId: number) {
    const response = await apiClient.get<ApiResponse<StatsDetail>>(
      `/steam-stats/app/${appId}/latest`,
    );
    return response.data;
  },
};

export default gamesApi;
