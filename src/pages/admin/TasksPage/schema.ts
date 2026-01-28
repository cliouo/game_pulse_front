import { z } from "zod"

import type { Task } from "@/types"

export const priorityOptions = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const

export const taskFormSchema = z.object({
  name: z.string().min(1, "任务名称不能为空"),
  description: z.string().optional(),
  type: z.string().min(1, "请选择任务类型"),
  cron_expression: z.string().optional(),
  priority: z.enum(priorityOptions),
  enabled: z.boolean(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  timeout: z.number().min(0).optional(),
  max_retries: z.number().min(0).optional(),
  retry_interval: z.number().min(0).optional(),
  concurrency: z.number().min(0).optional(),
  single_run: z.boolean().optional(),
})

export type TaskFormData = z.infer<typeof taskFormSchema>

export type TaskValidationResult = {
  valid: boolean
  errors: string[]
}

export function taskToFormData(task?: Task): Partial<TaskFormData> {
  if (!task) {
    return {
      name: "",
      description: "",
      type: "",
      cron_expression: "",
      priority: "NORMAL",
      enabled: true,
      parameters: {},
    }
  }

  return {
    name: task.name,
    description: task.description,
    type: task.type,
    cron_expression: task.cron_expression,
    priority: task.priority,
    enabled: task.enabled,
    parameters: task.parameters as Record<string, unknown>,
    timeout: task.timeout,
    max_retries: task.max_retries,
    retry_interval: task.retry_interval,
    concurrency: task.concurrency,
    single_run: task.single_run,
  }
}

export function formDataToTask(data: TaskFormData): Partial<Task> {
  return {
    name: data.name.trim(),
    description: data.description?.trim(),
    type: data.type as Task["type"],
    cron_expression: data.cron_expression?.trim() || undefined,
    priority: data.priority,
    enabled: data.enabled,
    parameters: data.parameters,
    timeout: data.timeout,
    max_retries: data.max_retries,
    retry_interval: data.retry_interval,
    concurrency: data.concurrency,
    single_run: data.single_run,
  }
}
