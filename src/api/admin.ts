import apiClient from './client';
import type {
  AdminTasksQueryParams,
  ApiResponse,
  CrawlExecutionDetail,
  CrawlLogsQueryParams,
  PaginatedResponse,
  SchedulerStatus,
  SystemSetting,
  Task,
  TaskExecution,
  TaskExecutionLog,
  TaskStats,
  TaskTypeOption,
  WhitelistGame,
} from '@/types';

const adminApi = {
  async getTasks(params: AdminTasksQueryParams) {
    const response = await apiClient.get<PaginatedResponse<Task>>('/admin/tasks', {
      params,
    });
    return response.data;
  },

  async getTask(id: number) {
    const response = await apiClient.get<ApiResponse<Task>>(`/admin/tasks/${id}`);
    return response.data;
  },

  async createTask(task: Partial<Task>) {
    const response = await apiClient.post<ApiResponse<Task>>('/admin/tasks', task);
    return response.data;
  },

  async updateTask(id: number, task: Partial<Task>) {
    const response = await apiClient.put<ApiResponse<Task>>(`/admin/tasks/${id}`, task);
    return response.data;
  },

  async deleteTask(id: number) {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/tasks/${id}`);
    return response.data;
  },

  async executeTask(id: number) {
    const response = await apiClient.post<ApiResponse<TaskExecution>>(`/admin/tasks/${id}/execute`);
    return response.data;
  },

  async cancelTask(id: number) {
    const response = await apiClient.post<ApiResponse<void>>(`/admin/tasks/${id}/cancel`);
    return response.data;
  },

  async getTaskExecutions(id: number, page = 1, pageSize = 20) {
    const response = await apiClient.get<PaginatedResponse<TaskExecution>>(
      `/admin/tasks/${id}/executions`,
      {
        params: { page, page_size: pageSize },
      }
    );
    return response.data;
  },

  async getExecutionLogs(
    taskId: number,
    executionId: number,
    params?: {
      level?: string;
      step?: string;
      search?: string;
      page?: number;
      page_size?: number;
    }
  ) {
    const response = await apiClient.get<PaginatedResponse<TaskExecutionLog>>(
      `/admin/tasks/${taskId}/executions/${executionId}/logs`,
      { params }
    );
    return response.data;
  },

  async getTaskStats() {
    const response = await apiClient.get<ApiResponse<TaskStats[]>>('/admin/tasks/stats');
    return response.data;
  },

  async getTaskTypes() {
    const response = await apiClient.get<ApiResponse<TaskTypeOption[]>>('/admin/tasks/types');
    return response.data;
  },

  async getTaskTypeSchema(type: string) {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/admin/tasks/types/${type}/schema`,
    );
    return response.data;
  },

  async updateTaskTypeSchema(type: string, schema: Record<string, unknown>) {
    const response = await apiClient.put<ApiResponse<Record<string, unknown>>>(
      `/admin/tasks/types/${type}/schema`,
      schema,
    );
    return response.data;
  },

  async createTaskTemplate(params: { type: string; [key: string]: unknown }) {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      '/admin/tasks/templates',
      params,
    );
    return response.data;
  },

  async runJob(type: string, limit?: number) {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      '/admin/jobs/run',
      null,
      {
        params: { type, limit },
      },
    );
    return response.data;
  },

  async validateTaskParams(taskType: string, parameters: Record<string, unknown>) {
    const response = await apiClient.post<ApiResponse<{ valid: boolean; errors: string[] }>>(
      '/admin/tasks/validate',
      {
        task_type: taskType,
        parameters,
      },
    );
    return response.data;
  },

  async getSchedulerStatus() {
    const response = await apiClient.get<ApiResponse<SchedulerStatus>>('/admin/scheduler/status');
    return response.data;
  },

  async getSchedulerConfig() {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>('/admin/scheduler/config');
    return response.data;
  },

  async startScheduler() {
    const response = await apiClient.post<ApiResponse<void>>('/admin/scheduler/start');
    return response.data;
  },

  async stopScheduler() {
    const response = await apiClient.post<ApiResponse<void>>('/admin/scheduler/stop');
    return response.data;
  },

  async restartScheduler() {
    const response = await apiClient.post<ApiResponse<void>>('/admin/scheduler/restart');
    return response.data;
  },

  // Crawl Scope
  async getCrawlScope() {
    const response = await apiClient.get<ApiResponse<SystemSetting[]>>('/admin/crawl-scope');
    return response.data;
  },

  async updateCrawlScope(settings: Record<string, string>) {
    const response = await apiClient.put<ApiResponse<SystemSetting[]>>('/admin/crawl-scope', {
      settings,
    });
    return response.data;
  },

  async getWhitelistGames(params?: { page?: number; page_size?: number }) {
    const response = await apiClient.get<PaginatedResponse<WhitelistGame>>(
      '/admin/crawl-scope/whitelist/games',
      { params }
    );
    return response.data;
  },

  async addWhitelistGame(appId: number) {
    const response = await apiClient.post<ApiResponse<{ message: string; app_id: number }>>(
      '/admin/crawl-scope/whitelist/games',
      { app_id: appId }
    );
    return response.data;
  },

  async removeWhitelistGame(appId: number) {
    const response = await apiClient.delete<ApiResponse<{ message: string; app_id: number }>>(
      `/admin/crawl-scope/whitelist/games/${appId}`
    );
    return response.data;
  },

  async importWhitelistFromConfig() {
    const response = await apiClient.post<
      ApiResponse<{ message: string; imported: number; total: number }>
    >('/admin/crawl-scope/whitelist/import-config');
    return response.data;
  },

  // Crawl Logs
  async getCrawlLogs(params: CrawlLogsQueryParams) {
    const response = await apiClient.get<PaginatedResponse<CrawlExecutionDetail>>(
      '/admin/crawl-logs',
      { params },
    );
    return response.data;
  },

  async getCrawlLog(id: number) {
    const response = await apiClient.get<ApiResponse<CrawlExecutionDetail>>(
      `/admin/crawl-logs/${id}`,
    );
    return response.data;
  },
};

export default adminApi;
