import apiClient from './client';
import type {
  ApiResponse,
  GameTrendData,
  MarketOpportunity,
  PaginatedResponse,
  PotentialGameScore,
  PotentialGamesQueryParams,
  PublisherDashboardStats,
  PublisherRecommendation,
} from '@/types';

const publisherApi = {
  async getDashboardStats() {
    const response = await apiClient.get<ApiResponse<PublisherDashboardStats>>(
      '/publisher/dashboard-stats',
    );
    return response.data;
  },

  async getPotentialGames(params: PotentialGamesQueryParams) {
    const response = await apiClient.get<PaginatedResponse<PotentialGameScore>>(
      '/publisher/potential-games',
      { params },
    );
    return response.data;
  },

  async getMarketOpportunities() {
    const response = await apiClient.get<ApiResponse<MarketOpportunity[]>>(
      '/publisher/market-opportunities',
    );
    return response.data;
  },

  async getGameTrends(appId: number) {
    const response = await apiClient.get<ApiResponse<GameTrendData>>(
      `/publisher/games/${appId}/trends`,
    );
    return response.data;
  },

  async getRecommendations() {
    const response = await apiClient.get<ApiResponse<PublisherRecommendation[]>>(
      '/publisher/recommendations',
    );
    return response.data;
  },
};

export default publisherApi;
