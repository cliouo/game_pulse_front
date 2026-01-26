import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/api/admin';
import type { AdminTasksQueryParams, Task } from '@/types';

const adminKeys = {
  tasks: (params?: AdminTasksQueryParams) => ['admin-tasks', params] as const,
  tasksRoot: ['admin-tasks'] as const,
  task: (id: number) => ['admin-task', id] as const,
  executions: (id: number) => ['admin-task-executions', id] as const,
  stats: ['admin-task-stats'] as const,
  types: ['admin-task-types'] as const,
  scheduler: ['admin-scheduler-status'] as const,
};

export function useAdminTasks(params: AdminTasksQueryParams) {
  return useQuery({
    queryKey: adminKeys.tasks(params),
    queryFn: () => adminApi.getTasks(params),
  });
}

export function useAdminTask(id: number) {
  return useQuery({
    queryKey: adminKeys.task(id),
    queryFn: () => adminApi.getTask(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Partial<Task>) => adminApi.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tasksRoot });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, task }: { id: number; task: Partial<Task> }) =>
      adminApi.updateTask(id, task),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tasksRoot });
      queryClient.invalidateQueries({ queryKey: adminKeys.task(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tasksRoot });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useExecuteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.executeTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tasksRoot });
      queryClient.invalidateQueries({ queryKey: adminKeys.executions(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      queryClient.invalidateQueries({ queryKey: adminKeys.scheduler });
    },
  });
}

export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.cancelTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tasksRoot });
      queryClient.invalidateQueries({ queryKey: adminKeys.executions(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useTaskExecutions(id: number, enabled = true) {
  return useQuery({
    queryKey: adminKeys.executions(id),
    queryFn: () => adminApi.getTaskExecutions(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: adminApi.getTaskStats,
  });
}

export function useTaskTypes() {
  return useQuery({
    queryKey: adminKeys.types,
    queryFn: adminApi.getTaskTypes,
  });
}

export function useValidateTaskParams() {
  return useMutation({
    mutationFn: ({
      taskType,
      parameters,
    }: {
      taskType: string;
      parameters: Record<string, unknown>;
    }) => adminApi.validateTaskParams(taskType, parameters),
  });
}

export function useSchedulerStatus() {
  return useQuery({
    queryKey: adminKeys.scheduler,
    queryFn: adminApi.getSchedulerStatus,
  });
}

export function useStartScheduler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.startScheduler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scheduler });
    },
  });
}

export function useStopScheduler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.stopScheduler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scheduler });
    },
  });
}

export function useRestartScheduler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.restartScheduler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scheduler });
    },
  });
}
