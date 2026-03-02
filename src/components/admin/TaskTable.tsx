import { Fragment, useMemo, useState } from "react"
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

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import type { Task, TaskExecution, TaskPriority, TaskStatus } from "@/types"

const placeholderRows = Array.from({ length: 6 })

const statusLabels: Record<TaskStatus, string> = {
  PENDING: "等待中",
  RUNNING: "运行中",
  SUCCESS: "成功",
  FAILED: "失败",
  CANCELLED: "已取消",
}

const statusToneMap: Record<TaskStatus, string> = {
  PENDING: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  RUNNING: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  SUCCESS: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  FAILED: "border-rose-400/40 bg-rose-400/10 text-rose-400",
  CANCELLED: "border-slate-400/40 bg-slate-400/10 text-slate-400",
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "低",
  NORMAL: "常规",
  HIGH: "高",
  CRITICAL: "紧急",
}

const priorityToneMap: Record<TaskPriority, string> = {
  LOW: "border-slate-400/40 bg-slate-400/10 text-slate-400",
  NORMAL: "border-sky-400/40 bg-sky-400/10 text-sky-400",
  HIGH: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  CRITICAL: "border-rose-400/40 bg-rose-400/10 text-rose-400",
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

const formatDuration = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  if (value < 60) {
    return `${value.toFixed(1)}s`
  }
  const minutes = Math.floor(value / 60)
  const seconds = Math.round(value % 60)
  return `${minutes}m ${seconds}s`
}

type TaskTableProps = {
  tasks?: Task[]
  loading?: boolean
  error?: boolean
  onExecute?: (task: Task) => void
  onCancel?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
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
  isActionPending,
  className,
}: TaskTableProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)

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
            {executions.map((execution) => (
              <div
                key={`execution-${execution.id}`}
                className="space-y-2 rounded-md border border-border/60 bg-background/60 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
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
                    <span className="text-muted-foreground">
                      耗时 {formatDuration(execution.duration)}
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
              </div>
            ))}
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
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="w-[140px]">类型</TableHead>
              <TableHead className="w-[120px]">状态</TableHead>
              <TableHead className="w-[120px]">优先级</TableHead>
              <TableHead className="w-[160px]">下次执行</TableHead>
              <TableHead className="w-[220px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? placeholderRows.map((_, index) => (
                  <TableRow key={`task-skeleton-${index}`}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : error
                ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                        task.status !== "RUNNING" && task.status !== "PENDING"
                      const canCancel =
                        task.status === "RUNNING" || task.status === "PENDING"

                      return (
                        <Fragment key={`task-${task.id}`}>
                          <TableRow
                            className={cn(
                              "cursor-pointer",
                              isExpanded && "bg-muted/30"
                            )}
                            onClick={() => toggleRow(task.id)}
                          >
                            <TableCell className="w-[90px]">
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
                                  <span className="text-sm font-medium">
                                    {task.name}
                                  </span>
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
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDateTime(task.next_run_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-1">
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onCancel?.(task)
                                  }}
                                  disabled={!canCancel || isPending}
                                >
                                  <OctagonX className="h-3.5 w-3.5" />
                                  取消
                                </Button>
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
                              <TableCell colSpan={7} className="bg-muted/10">
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
                          colSpan={7}
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
