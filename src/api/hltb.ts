import apiClient from './client';
import type { ApiResponse, HLTBInfo } from '@/types';

const hltbApi = {
  async getByAppId(appId: number) {
    const response = await apiClient.get<ApiResponse<HLTBInfo>>('/hltb/' + appId);
    return response.data;
  },
};

export default hltbApi;
