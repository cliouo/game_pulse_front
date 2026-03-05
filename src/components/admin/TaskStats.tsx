import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { TaskStats } from "@/types"

const placeholderItems = Array.from({ length: 6 })

const formatPercent = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  const normalized = value <= 1 ? value * 100 : value
  return `${Math.round(normalized)}%`
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

const formatDateTime = (value?: string) => {
  if (!value || typeof value !== "string") {
    return "--"
  }
  const parsed = parseISO(value)
  if (isValid(parsed)) {
    return format(parsed, "MM-dd HH:mm", { locale: zhCN })
  }
  const fallback = new Date(value)
  if (isValid(fallback)) {
    return format(fallback, "MM-dd HH:mm", { locale: zhCN })
  }
  return value
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "running":
      return "运行中"
    case "pending":
      return "等待中"
    case "completed":
      return "成功"
    case "failed":
      return "失败"
    case "cancelled":
      return "已取消"
    default:
      return "未知"
  }
}

const getStatusTone = (status?: string) => {
  switch (status) {
    case "running":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
    case "pending":
      return "border-amber-400/40 bg-amber-400/10 text-amber-400"
    case "completed":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
    case "failed":
      return "border-rose-400/40 bg-rose-400/10 text-rose-400"
    case "cancelled":
      return "border-slate-400/40 bg-slate-400/10 text-slate-400"
    default:
      return "border-border/60 bg-muted/20 text-muted-foreground"
  }
}

type TaskStatsProps = {
  stats?: TaskStats[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  className?: string
}

export default function TaskStats({
  stats = [],
  loading = false,
  error = false,
  onRetry,
  className,
}: TaskStatsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">任务统计</h2>
          <p className="text-xs text-muted-foreground">
            按任务维度汇总运行表现
          </p>
        </div>
      </div>
      {error ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
          <span>任务统计加载失败，请稍后重试。</span>
          {onRetry ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              重试
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? placeholderItems.map((_, index) => (
                <Card
                  key={`task-stats-skeleton-${index}`}
                  className="border-border/60 bg-card/60"
                >
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))
            : stats.length > 0
              ? stats.map((stat) => (
                  <Card
                    key={`task-stat-${stat.task_id}`}
                    className="border-border/60 bg-card/60"
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">
                            {stat.task_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.task_type}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-1 text-xs font-semibold",
                            getStatusTone(stat.last_run_status)
                          )}
                        >
                          {getStatusLabel(stat.last_run_status)}
                        </span>
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {formatPercent(stat.success_rate)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>总运行: {stat.total_runs ?? "--"}</div>
                        <div>
                          成功/失败: {stat.success_runs ?? "--"}/
                          {stat.failed_runs ?? "--"}
                        </div>
                        <div>平均耗时: {formatDuration(stat.avg_duration)}</div>
                        <div>最近执行: {formatDateTime(stat.last_run_time)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : (
                  <div className="col-span-full flex h-36 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
                    暂无任务统计数据
                  </div>
                )}
        </div>
      )}
    </div>
  )
}
