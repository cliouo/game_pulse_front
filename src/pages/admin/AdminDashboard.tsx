import { useMemo } from "react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import SchedulerControl from "@/components/admin/SchedulerControl"
import TaskStats from "@/components/admin/TaskStats"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTaskStats } from "@/hooks/use-admin"
import { cn } from "@/lib/utils"
import type { TaskStats as TaskStatsItem } from "@/types"

const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const toValidDate = (value?: string | number) => {
  if (!value && value !== 0) {
    return null
  }
  if (typeof value === "number") {
    const date = new Date(value < 1e12 ? value * 1000 : value)
    return isValid(date) ? date : null
  }
  const parsed = parseISO(value)
  if (isValid(parsed)) {
    return parsed
  }
  const fallback = new Date(value)
  return isValid(fallback) ? fallback : null
}

const formatDateTime = (value?: string | number) => {
  const date = toValidDate(value)
  if (!date) {
    return "--"
  }
  return format(date, "MM-dd HH:mm", { locale: zhCN })
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

const normalizePercent = (value?: number) => {
  if (typeof value !== "number") {
    return undefined
  }
  return value <= 1 ? value * 100 : value
}

const formatPercent = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return `${Math.round(value)}%`
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

const getRecentStats = (stats: TaskStatsItem[]) =>
  stats
    .filter((item) => Boolean(item.last_run_time))
    .sort(
      (a, b) =>
        (toValidDate(b.last_run_time)?.getTime() ?? 0) -
        (toValidDate(a.last_run_time)?.getTime() ?? 0)
    )
    .slice(0, 10)

type OverviewCardProps = {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  iconClassName: string
  loading?: boolean
}

function OverviewCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  loading = false,
}: OverviewCardProps) {
  return (
    <Card className="border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className={cn("h-4 w-4", iconClassName)} />
          <span>{title}</span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-semibold text-foreground">{value}</div>
        )}
        {loading ? (
          <Skeleton className="h-4 w-28" />
        ) : (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const statsQuery = useTaskStats()
  const stats = useMemo(
    () => {
      const d = statsQuery.data?.data
      return Array.isArray(d) ? d : []
    },
    [statsQuery.data?.data]
  )

  const recentStats = useMemo(() => getRecentStats(stats), [stats])
  const runningTasks = useMemo(
    () => stats.filter((item) => item.last_run_status === "running").length,
    [stats]
  )
  const failedTasks = useMemo(
    () => stats.filter((item) => item.last_run_status === "failed").length,
    [stats]
  )
  const totalRuns = useMemo(
    () =>
      stats.reduce(
        (sum, item) => sum + (typeof item.total_runs === "number" ? item.total_runs : 0),
        0
      ),
    [stats]
  )
  const avgSuccessRate = useMemo(() => {
    const rates = stats
      .map((item) => normalizePercent(item.success_rate))
      .filter((value): value is number => typeof value === "number")
    if (rates.length === 0) {
      return undefined
    }
    return rates.reduce((sum, value) => sum + value, 0) / rates.length
  }, [stats])
  const summaryCards = useMemo(
    () => [
      {
        key: "running",
        title: "运行中任务",
        value: formatNumber(runningTasks),
        subtitle: `共 ${formatNumber(stats.length)} 个任务`,
        icon: Activity,
        iconClassName: "text-emerald-400",
      },
      {
        key: "runs",
        title: "总执行次数",
        value: formatNumber(totalRuns),
        subtitle: "当前接口返回累计执行次数",
        icon: Gauge,
        iconClassName: "text-sky-400",
      },
      {
        key: "success",
        title: "成功率",
        value: formatPercent(avgSuccessRate),
        subtitle:
          stats.length > 0
            ? `基于 ${formatNumber(stats.length)} 个任务均值`
            : "暂无任务数据",
        icon: CheckCircle2,
        iconClassName: "text-emerald-400",
      },
      {
        key: "failed",
        title: "失败任务",
        value: formatNumber(failedTasks),
        subtitle: "最近一次执行状态为失败",
        icon: AlertTriangle,
        iconClassName: "text-rose-400",
      },
    ],
    [avgSuccessRate, failedTasks, runningTasks, stats.length, totalRuns]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">管理后台概览</h1>
          <p className="text-sm text-muted-foreground">
            监控任务调度、执行与统计指标
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/tasks">进入任务管理</Link>
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <OverviewCard
            key={card.key}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            iconClassName={card.iconClassName}
            loading={statsQuery.isLoading}
          />
        ))}
      </section>

      <section>
        <SchedulerControl />
      </section>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">
              最近活动
            </CardTitle>
            <Button asChild size="sm" variant="ghost" className="text-xs">
              <Link to="/admin/tasks">查看全部</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {statsQuery.isError ? (
            <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
              <span>最近执行列表加载失败，请稍后重试。</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => statsQuery.refetch()}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                重试
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute bottom-2 left-[7px] top-2 border-l border-border/60" />
              <div className="space-y-3">
                {statsQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`recent-skeleton-${index}`}
                        className="relative pl-6"
                      >
                        <span className="absolute left-[3px] top-3 h-2.5 w-2.5 rounded-full bg-border/80" />
                        <Skeleton className="h-14 w-full" />
                      </div>
                    ))
                  : recentStats.length > 0
                    ? recentStats.map((item) => {
                        const failed = item.last_run_status === "failed"
                        return (
                          <div
                            key={`recent-${item.task_id}`}
                            className={cn(
                              "relative rounded-lg border border-l-2 bg-background/35 px-3 py-3 pl-6",
                              failed
                                ? "border-rose-400/40 border-l-rose-400"
                                : "border-border/60 border-l-border/60"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute left-[3px] top-5 h-2.5 w-2.5 rounded-full",
                                failed ? "bg-rose-400" : "bg-emerald-400"
                              )}
                            />
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="font-medium">{item.task_name}</span>
                              <span className="text-muted-foreground">→</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  getStatusTone(item.last_run_status)
                                )}
                              >
                                {getStatusLabel(item.last_run_status)}
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>耗时 {formatDuration(item.avg_duration)}</span>
                              <span>{formatDateTime(item.last_run_time)}</span>
                            </div>
                          </div>
                        )
                      })
                    : (
                        <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 py-6 text-center text-sm text-muted-foreground">
                          暂无执行记录
                        </div>
                      )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section>
        <TaskStats
          stats={stats}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => statsQuery.refetch()}
        />
      </section>
    </div>
  )
}
