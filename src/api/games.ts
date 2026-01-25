import apiClient from './client';
import type { ApiResponse, GamesQueryParams, GameWithStats, PaginatedResponse } from '@/types';

const gamesApi = {
  async getGames(params: GamesQueryParams) {
    const response = await apiClient.get<PaginatedResponse<GameWithStats>>('/games', {
      params,
    });
    return response.data;
  },

  async searchGames(keyword: string) {
    const response = await apiClient.get<ApiResponse<GameWithStats[]>>('/games/search', {
      params: { keyword },
    });
    return response.data;
  },

  async getGameById(id: number) {
    const response = await apiClient.get<ApiResponse<GameWithStats>>(`/games/${id}`);
    return response.data;
  },
};

export default gamesApi;
