import { useMemo, useState } from "react"
import { format } from "date-fns"

import { API_BASE_URL } from "@/api/config"
import Pagination from "@/components/common/Pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCrawlLogs } from "@/hooks/use-admin"
import type { CrawlExecutionDetail, CrawlLogEntry, CrawlLogsQueryParams } from "@/types"

const endpointOptions = [
  { value: "GetGraphMax", label: "GetGraphMax" },
  { value: "GetGraphWeek", label: "GetGraphWeek" },
  { value: "GetPriceHistory", label: "GetPriceHistory" },
  { value: "GetGraphFollowers", label: "GetGraphFollowers" },
  { value: "page:game_tags", label: "page:game_tags" },
  { value: "page:game_overview", label: "page:game_overview" },
  { value: "page:ranking_mostfollowed", label: "page:ranking_mostfollowed" },
  { value: "page:ranking_toprated", label: "page:ranking_toprated" },
  { value: "page:ranking_mostwishlisted", label: "page:ranking_mostwishlisted" },
  { value: "page:ranking_mostplayed", label: "page:ranking_mostplayed" },
  { value: "page:sales", label: "page:sales" },
]

const successTone: Record<string, string> = {
  true: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  false: "border-rose-400/40 bg-rose-400/10 text-rose-400",
}

const logLevelTone: Record<string, string> = {
  info: "text-muted-foreground",
  warn: "text-amber-400",
  error: "text-rose-400",
}

function parseLogs(raw: string): CrawlLogEntry[] {
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function screenshotUrl(id: number) {
  return `${API_BASE_URL}/admin/crawl-logs/${id}/screenshot`
}

export default function CrawlLogsPage() {
  const [endpointFilter, setEndpointFilter] = useState("all")
  const [successFilter, setSuccessFilter] = useState("all")
  const [appIdInput, setAppIdInput] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selected, setSelected] = useState<CrawlExecutionDetail | null>(null)
  const [screenshotOpen, setScreenshotOpen] = useState(false)
  const [screenshotId, setScreenshotId] = useState<number | null>(null)

  const params = useMemo<CrawlLogsQueryParams>(
    () => ({
      page,
      page_size: pageSize,
      endpoint: endpointFilter === "all" ? undefined : endpointFilter,
      success: successFilter === "all" ? undefined : successFilter,
      app_id: appIdInput ? Number(appIdInput) : undefined,
    }),
    [page, pageSize, endpointFilter, successFilter, appIdInput],
  )

  const query = useCrawlLogs(params)
  const logs = useMemo(() => {
    const data = query.data?.data
    return Array.isArray(data) ? data : []
  }, [query.data?.data])
  const pagination = query.data?.pagination

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">爬虫执行日志</h1>
        <p className="text-sm text-muted-foreground">
          查看爬虫请求的结构化执行日志与异常截图
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={endpointFilter}
          onValueChange={(v) => {
            setEndpointFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[220px] border-border/60 bg-background/60">
            <SelectValue placeholder="端点" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部端点</SelectItem>
            {endpointOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={successFilter}
          onValueChange={(v) => {
            setSuccessFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[130px] border-border/60 bg-background/60">
            <SelectValue placeholder="结果" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="true">成功</SelectItem>
            <SelectItem value="false">失败</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="App ID"
          value={appIdInput}
          onChange={(e) => {
            setAppIdInput(e.target.value)
            setPage(1)
          }}
          className="h-9 w-[120px] border-border/60 bg-background/60"
        />
      </div>

      <div className="rounded-lg border border-border/60 bg-card/60 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>端点</TableHead>
              <TableHead className="w-20">AppID</TableHead>
              <TableHead className="w-16">结果</TableHead>
              <TableHead className="w-16">状态码</TableHead>
              <TableHead className="w-16">尝试</TableHead>
              <TableHead className="w-20">耗时</TableHead>
              <TableHead className="w-16">CF</TableHead>
              <TableHead className="w-40">时间</TableHead>
              <TableHead className="w-16">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-border/60">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow className="border-border/60">
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  暂无日志数据
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer border-border/60 hover:bg-muted/40"
                  onClick={() => setSelected(log)}
                >
                  <TableCell className="font-mono text-xs">{log.id}</TableCell>
                  <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                  <TableCell className="font-mono text-xs">{log.app_id || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${successTone[String(log.success)]}`}
                    >
                      {log.success ? "成功" : "失败"}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.status_code || "-"}</TableCell>
                  <TableCell className="text-xs">{log.attempt_count}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.total_elapsed_s.toFixed(1)}s
                  </TableCell>
                  <TableCell>
                    {log.cf_challenge ? (
                      <Badge
                        variant="outline"
                        className="border-amber-400/40 bg-amber-400/10 text-[10px] text-amber-400"
                      >
                        CF
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(log)
                      }}
                    >
                      详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.page_size}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={(v) => {
            setPageSize(v)
            setPage(1)
          }}
          className="border-border/60 bg-card/60"
        />
      ) : null}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>执行详情 #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">端点：</span>
                  <span className="font-mono">{selected.endpoint}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">AppID：</span>
                  <span className="font-mono">{selected.app_id || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">结果：</span>
                  <span className={successTone[String(selected.success)]}>
                    {selected.success ? "成功" : "失败"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">状态码：</span>
                  <span className="font-mono">{selected.status_code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">尝试次数：</span>
                  {selected.attempt_count}
                </div>
                <div>
                  <span className="text-muted-foreground">总耗时：</span>
                  <span className="font-mono">{selected.total_elapsed_s.toFixed(2)}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">代理：</span>
                  <span className="font-mono text-xs">{selected.proxy_used || (selected.session_id ? "direct" : "未知")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">会话：</span>
                  <span className="font-mono text-xs">{selected.session_id || "-"}</span>
                </div>
                {selected.trace_id ? (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Trace ID：</span>
                    <span className="font-mono text-xs">{selected.trace_id}</span>
                  </div>
                ) : null}
                {selected.cf_challenge ? (
                  <>
                    <div>
                      <span className="text-muted-foreground">CF 挑战：</span>
                      <Badge
                        variant="outline"
                        className="border-amber-400/40 bg-amber-400/10 text-[10px] text-amber-400"
                      >
                        是
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CF 耗时：</span>
                      <span className="font-mono">{selected.cf_solve_time_s.toFixed(1)}s</span>
                    </div>
                  </>
                ) : null}
                {selected.exception_type ? (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">异常：</span>
                    <span className="font-mono text-xs text-rose-400">
                      {selected.exception_type}: {selected.exception_msg}
                    </span>
                  </div>
                ) : null}
              </div>

              {(() => {
                const entries = parseLogs(selected.logs)
                if (entries.length === 0) return null
                return (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">执行日志</h3>
                    <div className="max-h-60 overflow-y-auto rounded-md border border-border/60 bg-background/60 p-3 font-mono text-xs leading-relaxed">
                      {entries.map((entry, i) => (
                        <div key={i} className={logLevelTone[entry.level] ?? "text-muted-foreground"}>
                          <span className="text-muted-foreground/60">
                            [{entry.elapsed_seconds.toFixed(1)}s]
                          </span>{" "}
                          <span className="font-semibold uppercase">{entry.level}</span>{" "}
                          {entry.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {!selected.success ? (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">异常截图</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScreenshotId(selected.id)
                      setScreenshotOpen(true)
                    }}
                  >
                    查看截图
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>异常截图</DialogTitle>
          </DialogHeader>
          {screenshotId ? (
            <div className="flex items-center justify-center">
              <img
                src={screenshotUrl(screenshotId)}
                alt="异常截图"
                className="max-h-[70vh] rounded-md border border-border/60 object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) {
                    const placeholder = document.createElement("div")
                    placeholder.className = "py-12 text-center text-sm text-muted-foreground"
                    placeholder.textContent = "暂无截图或截图已过期"
                    parent.appendChild(placeholder)
                  }
                }}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
