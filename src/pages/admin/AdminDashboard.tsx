import { useMemo } from "react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Link } from "react-router-dom"

import SchedulerControl from "@/components/admin/SchedulerControl"
import TaskStats from "@/components/admin/TaskStats"
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
import { useTaskStats } from "@/hooks/use-admin"
import { cn } from "@/lib/utils"
import type { TaskStats as TaskStatsItem } from "@/types"

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
        new Date(b.last_run_time).getTime() -
        new Date(a.last_run_time).getTime()
    )
    .slice(0, 6)

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

      <section>
        <SchedulerControl />
      </section>

      <section>
        <TaskStats
          stats={stats}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => statsQuery.refetch()}
        />
      </section>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">
              最近执行任务
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务</TableHead>
                  <TableHead className="w-[120px]">状态</TableHead>
                  <TableHead className="w-[160px]">最近执行</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsQuery.isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`recent-skeleton-${index}`}>
                        <TableCell colSpan={3}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : recentStats.length > 0
                    ? recentStats.map((item) => (
                        <TableRow key={`recent-${item.task_id}`}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {item.task_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.task_type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                getStatusTone(item.last_run_status)
                              )}
                            >
                              {getStatusLabel(item.last_run_status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(item.last_run_time)}
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            暂无执行记录
                          </TableCell>
                        </TableRow>
                      )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
