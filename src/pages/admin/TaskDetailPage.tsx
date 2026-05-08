import { Fragment, useEffect, useMemo, useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  ChevronDown,
  ChevronRight,
  CirclePlay,
  OctagonX,
  Pencil,
  Trash2,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import Pagination from "@/components/common/Pagination"
import ExecutionLogPanel from "@/components/admin/ExecutionLogPanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminTask,
  useCancelTask,
  useDeleteTask,
  useExecuteTask,
  useTaskExecutions,
  useTaskStats,
  useTaskTypes,
  useUpdateTask,
  useValidateTaskParams,
} from "@/hooks/use-admin"
import { cn } from "@/lib/utils"
import type {
  Task,
  TaskExecution,
  TaskExecutionStep,
  TaskPriority,
  TaskStatus,
  TaskTypeOption,
} from "@/types"

import TaskEditDialog from "./TasksPage/TaskEditDialog"
import { emptySchema, emptyUiSchema } from "./TasksPage/utils"

const statusLabels: Record<TaskStatus, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "成功",
  failed: "失败",
  cancelled: "已取消",
}

const statusToneMap: Record<TaskStatus, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  running: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  completed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-400",
  cancelled: "border-slate-400/40 bg-slate-400/10 text-slate-400",
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "低",
  normal: "常规",
  high: "高",
  urgent: "紧急",
}

const priorityToneMap: Record<TaskPriority, string> = {
  low: "border-slate-400/40 bg-slate-400/10 text-slate-400",
  normal: "border-sky-400/40 bg-sky-400/10 text-sky-400",
  high: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  urgent: "border-rose-400/40 bg-rose-400/10 text-rose-400",
}

const formatDateTime = (value?: string | number) => {
  if (!value && value !== 0) {
    return "--"
  }
  const fmt = "MM-dd HH:mm"
  if (typeof value === "number") {
    const d = new Date(value < 1e12 ? value * 1000 : value)
    return isValid(d) ? format(d, fmt, { locale: zhCN }) : "--"
  }
  const parsed = parseISO(value)
  if (isValid(parsed)) {
    return format(parsed, fmt, { locale: zhCN })
  }
  const fallback = new Date(value)
  return isValid(fallback) ? format(fallback, fmt, { locale: zhCN }) : value
}

const toTimestamp = (value?: string | number): number | null => {
  if (!value && value !== 0) return null
  if (typeof value === "number") {
    return value < 1e12 ? value : Math.floor(value / 1000)
  }
  const d = new Date(value)
  return isValid(d) ? Math.floor(d.getTime() / 1000) : null
}

const formatDuration = (execution: {
  duration?: number
  started_at?: string | number
  completed_at?: string | number
}) => {
  let seconds = execution.duration
  if (typeof seconds !== "number" || seconds === 0) {
    const start = toTimestamp(execution.started_at)
    const end = toTimestamp(execution.completed_at)
    if (start && end && end > start) {
      seconds = end - start
    } else {
      return "--"
    }
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}m ${secs}s`
}

const formatPercent = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  const normalized = value <= 1 ? value * 100 : value
  return `${Math.round(normalized)}%`
}

const hasNumberValue = (value?: number) => typeof value === "number"

const hasExecutionSummary = (execution: TaskExecution) =>
  hasNumberValue(execution.processed_count) ||
  hasNumberValue(execution.success_count) ||
  hasNumberValue(execution.failed_count)

const hasStepSummary = (step: TaskExecutionStep) =>
  hasNumberValue(step.processed) ||
  hasNumberValue(step.succeeded) ||
  hasNumberValue(step.failed)

const formatStepDateTime = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return formatDateTime(new Date(value * 1000).toISOString())
}

const formatParameterValue = (value: unknown) => {
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (value === null) {
    return "null"
  }
  if (typeof value === "undefined") {
    return "undefined"
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const taskId = Number(id)
  const hasValidTaskId = Number.isInteger(taskId) && taskId > 0

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [expandedExecutionIds, setExpandedExecutionIds] = useState<
    Record<number, boolean>
  >({})
  const [expandedExecutionOutputs, setExpandedExecutionOutputs] = useState<
    Record<number, boolean>
  >({})

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setExpandedExecutionIds({})
      setExpandedExecutionOutputs({})
      setEditingTask(null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [taskId])

  const taskQuery = useAdminTask(taskId)
  const task = taskQuery.data?.data
  const executionsQuery = useTaskExecutions(taskId, {
    page,
    pageSize,
    enabled: hasValidTaskId && Boolean(task),
  })
  const statsQuery = useTaskStats()
  const taskTypesQuery = useTaskTypes()

  const executeMutation = useExecuteTask()
  const cancelMutation = useCancelTask()
  const deleteMutation = useDeleteTask()
  const updateMutation = useUpdateTask()
  const validateMutation = useValidateTaskParams()

  const taskStats = useMemo(() => {
    const d = statsQuery.data?.data
    return Array.isArray(d) ? d : []
  }, [statsQuery.data?.data])

  const currentTaskStat = useMemo(
    () => taskStats.find((item) => item.task_id === task?.id),
    [task?.id, taskStats]
  )

  const currentTaskType = task?.type

  const typeOptions = useMemo<TaskTypeOption[]>(() => {
    const apiData = taskTypesQuery.data?.data
    const apiTypes = Array.isArray(apiData) ? apiData : []
    const normalizedTypes = apiTypes.map((type) => ({
      ...type,
      schema: type.schema ?? emptySchema,
      ui_schema: type.ui_schema ?? emptyUiSchema,
    }))
    const apiTypeValues = new Set(normalizedTypes.map((t) => t.value))
    const extraType =
      currentTaskType && !apiTypeValues.has(currentTaskType)
        ? [
            {
              value: currentTaskType,
              label: currentTaskType,
              description: "",
              schema: emptySchema,
              ui_schema: emptyUiSchema,
            } satisfies TaskTypeOption,
          ]
        : []
    return [...normalizedTypes, ...extraType]
  }, [taskTypesQuery.data?.data, currentTaskType])

  const executions = useMemo(() => {
    const d = executionsQuery.data?.data
    return Array.isArray(d) ? d : []
  }, [executionsQuery.data?.data])

  const executionPagination = executionsQuery.data?.pagination

  const parameterEntries = useMemo(
    () => Object.entries(task?.parameters ?? {}),
    [task?.parameters]
  )

  const isMutationPending = (targetTaskId: number) => {
    const isNumberMatch = (value: unknown) =>
      typeof value === "number" && value === targetTaskId
    const isObjectMatch = (value: unknown) =>
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      (value as { id: number }).id === targetTaskId

    return (
      (executeMutation.isPending && isNumberMatch(executeMutation.variables)) ||
      (cancelMutation.isPending && isNumberMatch(cancelMutation.variables)) ||
      (deleteMutation.isPending && isNumberMatch(deleteMutation.variables)) ||
      (updateMutation.isPending && isObjectMatch(updateMutation.variables))
    )
  }

  const validateTaskParams = async (
    taskType: string,
    parameters: Record<string, unknown>
  ) => {
    const response = await validateMutation.mutateAsync({
      taskType,
      parameters,
    })
    return response.data
  }

  const handleSave = (currentTask: Task, payload: Partial<Task>) => {
    updateMutation.mutate(
      {
        id: currentTask.id,
        task: {
          name: payload.name?.trim() || currentTask.name,
          description: payload.description?.trim() || currentTask.description,
          cron_expression:
            payload.cron_expression ?? currentTask.cron_expression,
          priority: payload.priority ?? currentTask.priority,
          enabled: payload.enabled ?? currentTask.enabled,
          parameters: payload.parameters ?? currentTask.parameters,
          timeout: payload.timeout ?? currentTask.timeout,
          max_retries: payload.max_retries ?? currentTask.max_retries,
          retry_interval: payload.retry_interval ?? currentTask.retry_interval,
          concurrency: payload.concurrency ?? currentTask.concurrency,
          single_run: payload.single_run ?? currentTask.single_run,
        },
      },
      {
        onSuccess: () => setEditingTask(null),
      }
    )
  }

  const toggleExecutionExpand = (executionId: number) => {
    setExpandedExecutionIds((prev) => ({
      ...prev,
      [executionId]: !prev[executionId],
    }))
  }

  const toggleExecutionOutput = (executionId: number) => {
    setExpandedExecutionOutputs((prev) => ({
      ...prev,
      [executionId]: !prev[executionId],
    }))
  }

  const renderExecutionDetail = (execution: TaskExecution) => {
    const output = execution.output?.trim()
    const hasOutput = Boolean(output)
    const outputExpanded = expandedExecutionOutputs[execution.id] ?? false
    const steps = execution.steps ?? []
    const hasSteps = steps.length > 0

    return (
      <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
        {execution.error_message ? (
          <div className="rounded-md border border-rose-400/30 bg-rose-400/10 p-2 text-xs text-rose-400">
            {execution.error_message}
          </div>
        ) : null}

        {hasSteps ? (
          <div className="space-y-2 rounded-md border border-border/50 bg-muted/10 p-2">
            <div className="text-[11px] font-semibold text-muted-foreground">
              执行步骤
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const showStepSummary = hasStepSummary(step)
                const hasStepError = Boolean(step.error_message?.trim())

                return (
                  <div
                    key={`execution-${execution.id}-step-${step.id}-${index}`}
                    className={cn(
                      "space-y-1 rounded-md border p-2 text-xs",
                      hasStepError
                        ? "border-rose-400/30 bg-rose-400/10"
                        : "border-border/60 bg-background/40"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{step.step}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", statusToneMap[step.status])}
                        >
                          {statusLabels[step.status]}
                        </Badge>
                        <span className="text-muted-foreground">
                          耗时{" "}
                          {formatDuration({
                            duration: step.duration,
                            started_at: step.started_at,
                            completed_at: step.finished_at,
                          })}
                        </span>
                      </div>
                      {showStepSummary ? (
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="tabular-nums text-muted-foreground">
                            处理 {step.processed ?? 0}
                          </span>
                          <span className="tabular-nums text-emerald-400">
                            成功 {step.succeeded ?? 0}
                          </span>
                          <span className="tabular-nums text-rose-400">
                            失败 {step.failed ?? 0}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    {(typeof step.started_at === "number" ||
                      typeof step.finished_at === "number") ? (
                        <div className="text-[11px] text-muted-foreground">
                          {formatStepDateTime(step.started_at)} →{" "}
                          {formatStepDateTime(step.finished_at)}
                        </div>
                      ) : null}
                    {step.error_message ? (
                      <div className="rounded-md border border-rose-400/30 bg-rose-400/10 p-2 text-[11px] text-rose-400">
                        {step.error_message}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {execution.log_count && execution.log_count > 0 ? (
          <ExecutionLogPanel
            taskId={taskId}
            executionId={execution.id}
            traceId={execution.trace_id}
          />
        ) : null}

        {hasOutput ? (
          <div className="space-y-1">
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => toggleExecutionOutput(execution.id)}
            >
              {outputExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              执行输出
            </button>
            {outputExpanded ? (
              <pre className="max-h-[200px] overflow-auto rounded-md border border-border/60 bg-muted/20 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {output}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  if (!hasValidTaskId) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="w-fit px-2 text-xs">
          <Link to="/admin/tasks">← 返回任务列表</Link>
        </Button>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            任务不存在
          </CardContent>
        </Card>
      </div>
    )
  }

  if (taskQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`task-detail-attr-skeleton-${index}`}
              className="border-border/60 bg-card/60"
            >
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (taskQuery.isError) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="w-fit px-2 text-xs">
          <Link to="/admin/tasks">← 返回任务列表</Link>
        </Button>
        <Card className="border-destructive/40 bg-destructive/10 shadow-sm">
          <CardContent className="flex flex-col gap-3 py-10 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
            <span>任务详情加载失败，请稍后重试。</span>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => taskQuery.refetch()}
            >
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="w-fit px-2 text-xs">
          <Link to="/admin/tasks">← 返回任务列表</Link>
        </Button>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            任务不存在
          </CardContent>
        </Card>
      </div>
    )
  }

  const canExecute = task.status !== "running" && task.status !== "pending"
  const canCancel = task.status === "running" || task.status === "pending"
  const actionPending = isMutationPending(task.id)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Link to="/admin/tasks">← 返回任务列表</Link>
          </Button>
          <h1 className="text-2xl font-bold">{task.name}</h1>
          {task.description ? (
            <p className="max-w-3xl text-sm text-muted-foreground">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => executeMutation.mutate(task.id)}
            disabled={!canExecute || actionPending}
          >
            <CirclePlay className="h-3.5 w-3.5" />
            执行
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => cancelMutation.mutate(task.id)}
            disabled={!canCancel || actionPending}
          >
            <OctagonX className="h-3.5 w-3.5" />
            取消
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingTask(task)}
            disabled={actionPending}
          >
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (window.confirm(`确定删除任务 “${task.name}” 吗？`)) {
                deleteMutation.mutate(task.id, {
                  onSuccess: () => navigate("/admin/tasks"),
                })
              }
            }}
            disabled={actionPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-1 p-4">
            <div className="text-xs text-muted-foreground">类型</div>
            <div className="text-sm font-semibold">{task.type}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-1 p-4">
            <div className="text-xs text-muted-foreground">状态</div>
            <Badge
              variant="outline"
              className={cn("text-[10px]", statusToneMap[task.status])}
            >
              {statusLabels[task.status]}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-1 p-4">
            <div className="text-xs text-muted-foreground">优先级</div>
            <Badge
              variant="outline"
              className={cn("text-[10px]", priorityToneMap[task.priority])}
            >
              {priorityLabels[task.priority]}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-1 p-4">
            <div className="text-xs text-muted-foreground">启用状态</div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                task.enabled
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                  : "border-slate-400/40 bg-slate-400/10 text-slate-400"
              )}
            >
              {task.enabled ? "启用" : "停用"}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-1 p-4">
            <div className="text-xs text-muted-foreground">Cron 表达式</div>
            <div className="break-all font-mono text-xs text-muted-foreground">
              {task.cron_expression || "--"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-1 p-4">
            <div className="text-xs text-muted-foreground">下次执行</div>
            <div className="text-sm font-medium text-foreground">
              {formatDateTime(task.next_run_at)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {parameterEntries.length > 0 ? (
            parameterEntries.map(([key, value]) => {
              const formatted = formatParameterValue(value)
              const isMultiline =
                formatted.includes("\n") || formatted.length > 80
              return (
                <div
                  key={`task-parameter-${key}`}
                  className="grid gap-2 rounded-md border border-border/60 bg-background/30 p-3 sm:grid-cols-[220px_1fr]"
                >
                  <div className="truncate text-xs font-medium text-muted-foreground">
                    {key}
                  </div>
                  {isMultiline ? (
                    <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground">
                      {formatted}
                    </pre>
                  ) : (
                    <div className="break-all text-xs text-foreground">{formatted}</div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              无参数
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="text-base font-semibold">统计摘要</div>
        {statsQuery.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            统计数据加载失败，当前显示占位值。
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={`task-stat-summary-skeleton-${index}`}
                  className="border-border/60 bg-card/60 shadow-sm"
                >
                  <CardContent className="space-y-2 p-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </CardContent>
                </Card>
              ))
            : (
                <>
                  <Card className="border-border/60 bg-card/60 shadow-sm">
                    <CardContent className="space-y-1 p-4">
                      <div className="text-xs text-muted-foreground">
                        总运行次数
                      </div>
                      <div className="text-2xl font-semibold tabular-nums">
                        {currentTaskStat?.total_runs ?? "--"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 bg-card/60 shadow-sm">
                    <CardContent className="space-y-1 p-4">
                      <div className="text-xs text-muted-foreground">成功率</div>
                      <div className="text-2xl font-semibold tabular-nums">
                        {formatPercent(currentTaskStat?.success_rate)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 bg-card/60 shadow-sm">
                    <CardContent className="space-y-1 p-4">
                      <div className="text-xs text-muted-foreground">平均耗时</div>
                      <div className="text-2xl font-semibold tabular-nums">
                        {formatDuration({
                          duration: currentTaskStat?.avg_duration,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 bg-card/60 shadow-sm">
                    <CardContent className="space-y-1 p-4">
                      <div className="text-xs text-muted-foreground">
                        最近执行时间
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {formatDateTime(currentTaskStat?.last_run_time)}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
        </div>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">执行历史</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table className="min-w-[940px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">ID</TableHead>
                <TableHead className="w-[180px]">状态</TableHead>
                <TableHead className="w-[120px]">耗时</TableHead>
                <TableHead>处理数/成功/失败</TableHead>
                <TableHead className="w-[170px]">开始时间</TableHead>
                <TableHead className="w-[120px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executionsQuery.isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`task-detail-execution-skeleton-${index}`}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : executionsQuery.isError
                  ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-6 text-center text-sm text-destructive"
                        >
                          执行历史加载失败
                        </TableCell>
                      </TableRow>
                    )
                  : executions.length > 0
                    ? executions.map((execution) => {
                        const isExpanded = expandedExecutionIds[execution.id] ?? false
                        const showSummary = hasExecutionSummary(execution)
                        return (
                          <Fragment key={`execution-${execution.id}`}>
                            <TableRow className={cn(isExpanded && "bg-muted/20")}>
                              <TableCell className="text-xs text-muted-foreground">
                                <div className="space-y-1">
                                  <div>#{execution.id}</div>
                                  {execution.trace_id ? (
                                    <div className="font-mono text-[10px] text-muted-foreground">
                                      trace:{execution.trace_id.slice(-8)}
                                    </div>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px]",
                                      statusToneMap[execution.status]
                                    )}
                                  >
                                    {statusLabels[execution.status]}
                                  </Badge>
                                  {execution.log_count && execution.log_count > 0 ? (
                                    <Badge
                                      variant="outline"
                                      className="border-sky-400/40 bg-sky-400/10 text-[10px] text-sky-400"
                                    >
                                      日志 {execution.log_count}
                                    </Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDuration(execution)}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {showSummary ? (
                                  <span className="tabular-nums">
                                    {execution.processed_count ?? 0} /{" "}
                                    <span className="text-emerald-400">
                                      {execution.success_count ?? 0}
                                    </span>{" "}
                                    /{" "}
                                    <span className="text-rose-400">
                                      {execution.failed_count ?? 0}
                                    </span>
                                  </span>
                                ) : (
                                  "--"
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDateTime(execution.started_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={() => toggleExecutionExpand(execution.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                  详情
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isExpanded ? (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/10">
                                  {renderExecutionDetail(execution)}
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </Fragment>
                        )
                      })
                    : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            暂无执行记录
                          </TableCell>
                        </TableRow>
                      )}
            </TableBody>
          </Table>

          {executionPagination ? (
            <Pagination
              page={executionPagination.page}
              pageSize={executionPagination.page_size}
              total={executionPagination.total}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value)
                setPage(1)
              }}
              className="mt-4 border-border/60 bg-muted/10"
            />
          ) : null}
        </CardContent>
      </Card>

      {editingTask ? (
        <TaskEditDialog
          open={Boolean(editingTask)}
          task={editingTask}
          saving={updateMutation.isPending}
          validating={validateMutation.isPending}
          typeOptions={typeOptions}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTask(null)
            }
          }}
          onValidate={validateTaskParams}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}
