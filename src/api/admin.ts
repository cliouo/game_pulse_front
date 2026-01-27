import apiClient from './client';
import type {
  AdminTasksQueryParams,
  ApiResponse,
  PaginatedResponse,
  SchedulerStatus,
  Task,
  TaskExecution,
  TaskStats,
  TaskTypeOption,
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

  async getTaskStats() {
    const response = await apiClient.get<ApiResponse<TaskStats[]>>('/admin/tasks/stats');
    return response.data;
  },

  async getTaskTypes() {
    const response = await apiClient.get<ApiResponse<TaskTypeOption[]>>('/admin/tasks/types');
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
};

export default adminApi;
