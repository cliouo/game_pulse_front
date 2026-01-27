import { useMemo, useState } from "react"
import { PauseCircle, PlayCircle, RefreshCcw, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useSchedulerStatus,
  useSchedulerConfig,
  useStartScheduler,
  useStopScheduler,
  useRestartScheduler,
  useRunJob,
} from "@/hooks/use-admin"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const formatUptime = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  if (value <= 0) {
    return "0s"
  }
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = Math.floor(value % 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

const formatStartTime = (value?: string) => {
  if (!value) {
    return "--"
  }
  try {
    const date = new Date(value)
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "--"
  }
}

const formatConfigValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "--"
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const getStatusTone = (isRunning?: boolean, isLoading?: boolean) => {
  if (isLoading) {
    return {
      label: "等待中",
      dotClass: "bg-amber-400",
      textClass: "text-amber-400",
    }
  }
  if (isRunning) {
    return {
      label: "运行中",
      dotClass: "bg-emerald-400",
      textClass: "text-emerald-400",
    }
  }
  return {
    label: "已停止",
    dotClass: "bg-rose-400",
    textClass: "text-rose-400",
  }
}

export default function SchedulerControl() {
  const statusQuery = useSchedulerStatus()
  const configQuery = useSchedulerConfig()
  const startMutation = useStartScheduler()
  const stopMutation = useStopScheduler()
  const restartMutation = useRestartScheduler()
  const runJobMutation = useRunJob()
  const [jobNotice, setJobNotice] = useState<{
    tone: "success" | "error"
    message: string
  } | null>(null)

  const status = statusQuery.data?.data
  const schedulerConfig = configQuery.data?.data
  const statusTone = getStatusTone(status?.enabled, statusQuery.isLoading)
  const isMutating =
    startMutation.isPending || stopMutation.isPending || restartMutation.isPending
  const pendingJobType = runJobMutation.variables?.type
  const isStorePending = runJobMutation.isPending && pendingJobType === "store"
  const isStatsPending = runJobMutation.isPending && pendingJobType === "stats"
  const taskSchedules = useMemo(() => {
    if (!status?.tasks) {
      return []
    }
    return Object.values(status.tasks).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [status?.tasks])
  const configEntries = useMemo(() => {
    if (!schedulerConfig || typeof schedulerConfig !== "object") {
      return []
    }
    return Object.entries(schedulerConfig).sort(([a], [b]) =>
      a.localeCompare(b)
    )
  }, [schedulerConfig])

  const handleRunJob = (type: "store" | "stats") => {
    setJobNotice(null)
    runJobMutation.mutate(
      { type },
      {
        onSuccess: (response) => {
          setJobNotice({
            tone: "success",
            message: response?.message || "任务触发成功",
          })
        },
        onError: () => {
          setJobNotice({
            tone: "error",
            message: "任务触发失败，请稍后重试。",
          })
        },
      }
    )
  }

  return (
    <Card className="border-border/60 bg-card/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">
              调度器状态
            </CardTitle>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  statusTone.dotClass
                )}
              />
              <span className={statusTone.textClass}>{statusTone.label}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => startMutation.mutate()}
              disabled={statusQuery.isLoading || status?.enabled || isMutating}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              启动
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => stopMutation.mutate()}
              disabled={statusQuery.isLoading || !status?.enabled || isMutating}
            >
              <PauseCircle className="h-3.5 w-3.5" />
              停止
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => restartMutation.mutate()}
              disabled={statusQuery.isLoading || !status?.enabled || isMutating}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              重启
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => handleRunJob("store")}
              disabled={statusQuery.isLoading || runJobMutation.isPending}
            >
              <Zap className="h-3.5 w-3.5" />
              {isStorePending ? "触发中..." : "触发 Store 任务"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => handleRunJob("stats")}
              disabled={statusQuery.isLoading || runJobMutation.isPending}
            >
              <Zap className="h-3.5 w-3.5" />
              {isStatsPending ? "触发中..." : "触发 Stats 任务"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {jobNotice ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium",
              jobNotice.tone === "success"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            )}
          >
            {jobNotice.message}
          </div>
        ) : null}
        {statusQuery.isError ? (
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
            <span>调度器状态获取失败，请稍后重试。</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => statusQuery.refetch()}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              重试
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
            {statusQuery.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`scheduler-metric-${index}`}
                    className="h-14 w-full"
                  />
                ))
              : (
                  <>
                    <div className="rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="text-muted-foreground">运行时长</div>
                      <div className="mt-1 text-sm font-semibold">
                        {formatUptime(status?.uptime)}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="text-muted-foreground">启动时间</div>
                      <div className="mt-1 text-sm font-semibold">
                        {formatStartTime(status?.start_time)}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="text-muted-foreground">注册任务</div>
                      <div className="mt-1 text-sm font-semibold">
                        {formatNumber(
                          status?.tasks ? Object.keys(status.tasks).length : 0
                        )}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="text-muted-foreground">启用任务</div>
                      <div className="mt-1 text-sm font-semibold text-emerald-400">
                        {formatNumber(
                          status?.tasks
                            ? Object.values(status.tasks).filter((t) => t.enabled)
                                .length
                            : 0
                        )}
                      </div>
                    </div>
                  </>
                )}
          </div>
        )}
        <div className="grid gap-3 text-xs lg:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-background/60 p-3">
            <div className="text-xs font-semibold text-muted-foreground">
              调度配置
            </div>
            {configQuery.isLoading ? (
              <div className="mt-2 space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={`scheduler-config-${index}`}
                    className="h-6 w-full"
                  />
                ))}
              </div>
            ) : configQuery.isError ? (
              <div className="mt-2 text-xs text-destructive">
                调度配置加载失败
              </div>
            ) : configEntries.length > 0 ? (
              <div className="mt-2 space-y-2">
                {configEntries.map(([key, value]) => (
                  <div
                    key={`scheduler-config-${key}`}
                    className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-muted/10 px-3 py-2"
                  >
                    <span className="text-muted-foreground">{key}</span>
                    <span className="break-all text-right text-foreground">
                      {formatConfigValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">
                暂无调度配置
              </div>
            )}
          </div>
          <div className="rounded-md border border-border/60 bg-background/60 p-3">
            <div className="text-xs font-semibold text-muted-foreground">
              任务计划
            </div>
            {statusQuery.isLoading ? (
              <div className="mt-2 space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={`scheduler-task-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : statusQuery.isError ? (
              <div className="mt-2 text-xs text-destructive">
                任务计划加载失败
              </div>
            ) : taskSchedules.length > 0 ? (
              <div className="mt-2 space-y-2">
                {taskSchedules.map((task) => (
                  <div
                    key={`scheduler-task-${task.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/10 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {task.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Cron: {task.cron_expression || "--"}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        task.enabled
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                          : "border-slate-400/40 bg-slate-400/10 text-slate-400"
                      )}
                    >
                      {task.enabled ? "启用" : "停用"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">
                暂无任务计划
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
