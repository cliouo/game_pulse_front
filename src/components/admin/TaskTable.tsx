import { Fragment, useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  CirclePlay,
  OctagonX,
  Pencil,
  Trash2,
} from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTaskExecutions } from "@/hooks/use-admin"
import { cn } from "@/lib/utils"
import type {
  Task,
  TaskExecution,
  TaskExecutionStep,
  TaskPriority,
  TaskStatus,
} from "@/types"

const placeholderRows = Array.from({ length: 6 })

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

const formatDuration = (execution: { duration?: number; started_at?: string | number; completed_at?: string | number }) => {
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

const toTimestamp = (value?: string | number): number | null => {
  if (!value && value !== 0) return null
  if (typeof value === "number") {
    return value < 1e12 ? value : Math.floor(value / 1000)
  }
  const d = new Date(value)
  return isValid(d) ? Math.floor(d.getTime() / 1000) : null
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

const cronToHuman = (cronExpression?: string) => {
  const cron = cronExpression?.trim()
  if (!cron) {
    return "手动"
  }
  switch (cron) {
    case "0 */1 * * *":
      return "每小时"
    case "0 */12 * * *":
      return "每12小时"
    case "0 0 * * *":
      return "每天"
    case "*/30 * * * *":
      return "每30分钟"
    default:
      return cron
  }
}

type TaskTableProps = {
  tasks?: Task[]
  loading?: boolean
  error?: boolean
  onExecute?: (task: Task) => void
  onCancel?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleEnabled?: (task: Task) => void
  defaultExpandedTaskId?: number | null
  isActionPending?: (taskId: number) => boolean
  className?: string
}

export default function TaskTable({
  tasks = [],
  loading = false,
  error = false,
  onExecute,
  onCancel,
  onEdit,
  onDelete,
  onToggleEnabled,
  defaultExpandedTaskId,
  isActionPending,
  className,
}: TaskTableProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(
    defaultExpandedTaskId ?? null
  )
  const [expandedExecutionOutputs, setExpandedExecutionOutputs] = useState<
    Record<number, boolean>
  >({})

  useEffect(() => {
    if (typeof defaultExpandedTaskId === "number") {
      const timer = window.setTimeout(() => {
        setExpandedTaskId(defaultExpandedTaskId)
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [defaultExpandedTaskId])

  const expandedTask = useMemo(
    () => tasks.find((task) => task.id === expandedTaskId),
    [tasks, expandedTaskId]
  )
  const shouldFetchExecutions =
    Boolean(expandedTaskId) && !expandedTask?.executions
  const executionsQuery = useTaskExecutions(
    expandedTaskId ?? 0,
    shouldFetchExecutions
  )

  const getExecutions = (task: Task): TaskExecution[] => {
    if (task.executions && task.executions.length > 0) {
      return task.executions
    }
    if (expandedTaskId === task.id) {
      return executionsQuery.data?.data ?? []
    }
    return []
  }

  const toggleRow = (taskId: number) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
  }

  const toggleExecutionOutput = (executionId: number) => {
    setExpandedExecutionOutputs((prev) => ({
      ...prev,
      [executionId]: !prev[executionId],
    }))
  }

  const renderExecutionHistory = (task: Task) => {
    const executions = getExecutions(task)
    const showLoading = expandedTaskId === task.id && executionsQuery.isLoading

    return (
      <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
        <div className="text-xs font-semibold text-muted-foreground">
          执行历史
        </div>
        {showLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : executions.length > 0 ? (
          <div className="space-y-2">
            {executions.map((execution) => {
              const showSummary = hasExecutionSummary(execution)
              const output = execution.output?.trim()
              const hasOutput = Boolean(output)
              const outputExpanded = expandedExecutionOutputs[execution.id] ?? false
              const steps = execution.steps ?? []
              const hasSteps = steps.length > 0

              return (
                <div
                  key={`execution-${execution.id}`}
                  className="space-y-2 rounded-md border border-border/60 bg-background/60 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">#{execution.id}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          statusToneMap[execution.status]
                        )}
                      >
                        {statusLabels[execution.status]}
                      </Badge>
                      {showSummary ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge
                            variant="outline"
                            className="h-5 border-border/60 bg-muted/20 px-1.5 text-[10px] text-muted-foreground"
                          >
                            处理{" "}
                            <span className="tabular-nums text-foreground">
                              {execution.processed_count ?? 0}
                            </span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className="h-5 border-emerald-400/40 bg-emerald-400/10 px-1.5 text-[10px] text-emerald-400"
                          >
                            成功{" "}
                            <span className="tabular-nums">
                              {execution.success_count ?? 0}
                            </span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className="h-5 border-rose-400/40 bg-rose-400/10 px-1.5 text-[10px] text-rose-400"
                          >
                            失败{" "}
                            <span className="tabular-nums">
                              {execution.failed_count ?? 0}
                            </span>
                          </Badge>
                        </div>
                      ) : null}
                      <span className="text-muted-foreground">
                        耗时 {formatDuration(execution)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateTime(execution.started_at)} →{" "}
                      {formatDateTime(execution.completed_at)}
                    </div>
                  </div>

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
                                    className={cn(
                                      "text-[10px]",
                                      statusToneMap[step.status]
                                    )}
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
            })}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">暂无执行记录</div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("border-border/60 bg-card/60 shadow-sm", className)}>
      <CardContent className="pt-4">
        <Table className="min-w-[1160px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="w-[140px]">类型</TableHead>
              <TableHead className="w-[110px]">状态</TableHead>
              <TableHead className="w-[100px]">优先级</TableHead>
              <TableHead className="w-[130px]">调度</TableHead>
              <TableHead className="w-[150px]">下次执行</TableHead>
              <TableHead className="w-[170px]">最近执行</TableHead>
              <TableHead className="w-[280px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? placeholderRows.map((_, index) => (
                  <TableRow key={`task-skeleton-${index}`}>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : error
                ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-6 text-center text-sm text-destructive"
                      >
                        任务列表加载失败
                      </TableCell>
                    </TableRow>
                  )
                : tasks.length > 0
                  ? tasks.map((task) => {
                      const isExpanded = expandedTaskId === task.id
                      const isPending = isActionPending?.(task.id) ?? false
                      const canExecute =
                        task.status !== "running" && task.status !== "pending"
                      const canCancel =
                        task.status === "running" || task.status === "pending"

                      return (
                        <Fragment key={`task-${task.id}`}>
                          <TableRow
                            className={cn(
                              "cursor-pointer",
                              isExpanded && "bg-muted/30"
                            )}
                            onClick={() => toggleRow(task.id)}
                          >
                            <TableCell className="w-[80px]">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span>#{task.id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    to={`/admin/tasks/${task.id}`}
                                    className="text-sm font-medium hover:underline"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    {task.name}
                                  </Link>
                                  <span
                                    className={cn(
                                      "rounded-full border px-2 py-0.5 text-[10px]",
                                      task.enabled
                                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                                        : "border-slate-400/40 bg-slate-400/10 text-slate-400"
                                    )}
                                  >
                                    {task.enabled ? "启用" : "停用"}
                                  </span>
                                </div>
                                {task.description ? (
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {task.description}
                                  </div>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {task.type}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  statusToneMap[task.status]
                                )}
                              >
                                {statusLabels[task.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  priorityToneMap[task.priority]
                                )}
                              >
                                {priorityLabels[task.priority]}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="max-w-[130px] truncate text-xs text-muted-foreground"
                              title={task.cron_expression || "手动"}
                            >
                              {cronToHuman(task.cron_expression)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDateTime(task.next_run_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                <span>{formatDateTime(task.last_run_at)}</span>
                                {task.last_run_status ? (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "w-fit text-[10px]",
                                      statusToneMap[task.last_run_status]
                                    )}
                                  >
                                    {statusLabels[task.last_run_status]}
                                  </Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-1">
                                <div
                                  className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Switch
                                    checked={task.enabled}
                                    onCheckedChange={() => onToggleEnabled?.(task)}
                                    disabled={isPending || !onToggleEnabled}
                                    aria-label={`切换任务 ${task.name} 启用状态`}
                                  />
                                  <span>{task.enabled ? "启用" : "停用"}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onExecute?.(task)
                                  }}
                                  disabled={!canExecute || isPending}
                                >
                                  <CirclePlay className="h-3.5 w-3.5" />
                                  执行
                                </Button>
                                {canCancel ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-[11px]"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      onCancel?.(task)
                                    }}
                                    disabled={isPending}
                                  >
                                    <OctagonX className="h-3.5 w-3.5" />
                                    取消
                                  </Button>
                                ) : null}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onEdit?.(task)
                                  }}
                                  disabled={isPending}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  编辑
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onDelete?.(task)
                                  }}
                                  disabled={isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  删除
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded ? (
                            <TableRow>
                              <TableCell colSpan={9} className="bg-muted/10">
                                {renderExecutionHistory(task)}
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </Fragment>
                      )
                    })
                  : (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          暂无任务
                        </TableCell>
                      </TableRow>
                    )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
