import { useEffect, useState } from "react"
import { format, isValid } from "date-fns"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Filter,
  Search,
} from "lucide-react"

import Pagination from "@/components/common/Pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useExecutionLogs } from "@/hooks/use-admin"
import { cn } from "@/lib/utils"
import type { TaskExecutionLog } from "@/types"

type ExecutionLogPanelProps = {
  taskId: number
  executionId: number
  traceId?: string
}

type LogContextProps = {
  context: string
}

const levelLabels: Record<TaskExecutionLog["level"], string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
}

const levelToneMap: Record<TaskExecutionLog["level"], string> = {
  info: "border-sky-400/40 bg-sky-400/10 text-sky-400",
  warn: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  error: "border-rose-400/40 bg-rose-400/10 text-rose-400",
}

const formatLogTime = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }

  const date = new Date(value < 1e12 ? value * 1000 : value)
  return isValid(date) ? format(date, "HH:mm:ss") : "--"
}

const formatLogContext = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return value
  }

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2)
  } catch {
    return value
  }
}

function LogContext({ context }: LogContextProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          上下文
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <pre className="max-h-64 overflow-auto rounded-md border border-border/60 bg-background/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {formatLogContext(context)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ExecutionLogPanel({
  taskId,
  executionId,
  traceId,
}: ExecutionLogPanelProps) {
  const [level, setLevel] = useState<"all" | TaskExecutionLog["level"]>("all")
  const [step, setStep] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const logsQuery = useExecutionLogs(taskId, executionId, {
    level: level === "all" ? undefined : level,
    step: step === "all" ? undefined : step,
    search: search.trim() || undefined,
    page,
    page_size: 50,
  })

  const logs = logsQuery.data?.data ?? []
  const pagination = logsQuery.data?.pagination
  const stepOptions = Array.from(
    new Set(
      logs.flatMap((log) => {
        const currentStep = log.step?.trim()
        return currentStep ? [currentStep] : []
      })
    )
  )

  if (step !== "all" && !stepOptions.includes(step)) {
    stepOptions.unshift(step)
  }

  const handleCopyTrace = async () => {
    if (!traceId || !navigator?.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(traceId)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border/50 bg-muted/10 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[11px] font-semibold text-muted-foreground">
              执行日志
            </div>
            {pagination ? (
              <Badge
                variant="outline"
                className="border-border/60 bg-background/40 text-[10px] text-muted-foreground"
              >
                {pagination.total} 条
              </Badge>
            ) : null}
            {logsQuery.isFetching && !logsQuery.isLoading ? (
              <span className="text-[11px] text-muted-foreground">更新中...</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">trace_id</span>
            <code className="rounded-md border border-border/60 bg-background/40 px-2 py-1 font-mono text-[11px] text-foreground">
              {traceId || "--"}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={handleCopyTrace}
              disabled={!traceId}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[520px]">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            过滤条件
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[150px_180px_minmax(0,1fr)]">
            <Select
              value={level}
              onValueChange={(value) => {
                setLevel(value as "all" | TaskExecutionLog["level"])
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 border-border/60 bg-background/60">
                <SelectValue placeholder="日志级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                <SelectItem value="info">INFO</SelectItem>
                <SelectItem value="warn">WARN</SelectItem>
                <SelectItem value="error">ERROR</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={step}
              onValueChange={(value) => {
                setStep(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 border-border/60 bg-background/60">
                <SelectValue placeholder="执行步骤" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部步骤</SelectItem>
                {stepOptions.map((option) => (
                  <SelectItem key={`log-step-${option}`} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="搜索日志内容"
                className="border-border/60 bg-background/60 pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {logsQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`execution-log-skeleton-${executionId}-${index}`}
              className="rounded-md border border-border/60 bg-background/40 p-3"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))
        ) : logsQuery.isError ? (
          <div className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
            <span>执行日志加载失败</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => logsQuery.refetch()}
            >
              重试
            </Button>
          </div>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={`execution-log-${log.id}`}
              className="space-y-2 rounded-md border border-border/60 bg-background/40 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatLogTime(log.created_at)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", levelToneMap[log.level])}
                  >
                    {levelLabels[log.level]}
                  </Badge>
                  {log.step ? (
                    <Badge
                      variant="outline"
                      className="border-border/60 bg-muted/20 text-[10px] text-muted-foreground"
                    >
                      {log.step}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="whitespace-pre-wrap break-words text-sm text-foreground">
                {log.message}
              </div>

              {log.context?.trim() ? <LogContext context={log.context} /> : null}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            暂无日志记录
          </div>
        )}
      </div>

      {pagination && pagination.total > 0 ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.page_size}
          total={pagination.total}
          onPageChange={setPage}
          pageSizeOptions={[50]}
          className="border-border/60 bg-background/30"
        />
      ) : null}
    </div>
  )
}
