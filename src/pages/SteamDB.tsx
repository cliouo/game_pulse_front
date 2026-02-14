import { type KeyboardEvent, useState } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ExternalLink, Heart, Search, Tag } from "lucide-react"

import Pagination from "@/components/common/Pagination"
import RankBadge from "@/components/rankings/RankBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentSales, useGameTags, useMostFollowed } from "@/hooks/use-steam-metadata"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("zh-CN")
const priceFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const currencySymbolMap: Record<string, string> = {
  CNY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
}

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const formatPrice = (value?: number, currency = "CNY") => {
  if (typeof value !== "number") {
    return "--"
  }
  const symbol = currencySymbolMap[currency]
  if (symbol) {
    return `${symbol}${priceFormatter.format(value)}`
  }
  return `${currency} ${priceFormatter.format(value)}`
}

const formatTimestamp = (value?: number) => {
  if (!value) {
    return "暂无更新"
  }
  return format(new Date(value * 1000), "yyyy年MM月dd日 HH:mm", { locale: zhCN })
}

const formatQueryTime = (value?: number) => {
  if (!value) {
    return "暂无更新"
  }
  return format(new Date(value), "yyyy年MM月dd日 HH:mm", { locale: zhCN })
}

const getRowClassName = (rank: number) => {
  if (rank === 1) {
    return "bg-gradient-to-r from-amber-200/70 via-amber-50/50 to-transparent hover:bg-transparent hover:brightness-95"
  }
  if (rank === 2) {
    return "bg-gradient-to-r from-slate-200/70 via-slate-50/50 to-transparent hover:bg-transparent hover:brightness-95"
  }
  if (rank === 3) {
    return "bg-gradient-to-r from-amber-300/60 via-orange-50/40 to-transparent hover:bg-transparent hover:brightness-95"
  }
  return ""
}

const skeletonRows = Array.from({ length: 8 })

export default function SteamDB() {
  const [activeTab, setActiveTab] = useState("mostfollowed")

  const [mostFollowedPage, setMostFollowedPage] = useState(1)
  const [mostFollowedPageSize, setMostFollowedPageSize] = useState(20)

  const [salesPage, setSalesPage] = useState(1)
  const [salesPageSize, setSalesPageSize] = useState(20)

  const [tagInput, setTagInput] = useState("")
  const [searchAppId, setSearchAppId] = useState<number | null>(null)
  const [tagError, setTagError] = useState("")

  const mostFollowedQuery = useMostFollowed(mostFollowedPage, mostFollowedPageSize)
  const salesQuery = useCurrentSales(salesPage, salesPageSize)
  const tagsQuery = useGameTags(searchAppId)

  const mostFollowedRecords = mostFollowedQuery.data?.data ?? []
  const mostFollowedTotal = mostFollowedQuery.data?.pagination.total ?? 0

  const salesRecords = salesQuery.data?.data ?? []
  const salesTotal = salesQuery.data?.pagination.total ?? 0

  const tagRecords = tagsQuery.data?.data ?? []

  const subtitleLoading =
    (activeTab === "mostfollowed" && mostFollowedQuery.isLoading) ||
    (activeTab === "sales" && salesQuery.isLoading) ||
    (activeTab === "tags" && searchAppId !== null && tagsQuery.isLoading)

  const subtitle =
    activeTab === "mostfollowed"
      ? `数据记录时间: ${formatTimestamp(mostFollowedRecords[0]?.recorded_at)}`
      : activeTab === "sales"
        ? `数据检测时间: ${formatTimestamp(salesRecords[0]?.detected_at)}`
        : searchAppId === null
          ? "请输入 App ID 查询标签"
          : `查询时间: ${formatQueryTime(tagsQuery.dataUpdatedAt)}`

  const handleTagSearch = () => {
    const parsed = Number(tagInput.trim())
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setTagError("请输入有效的 App ID")
      setSearchAppId(null)
      return
    }
    setTagError("")
    setSearchAppId(parsed)
  }

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleTagSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">SteamDB 数据</h1>
        {subtitleLoading ? (
          <Skeleton className="h-4 w-44" />
        ) : (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="mostfollowed">最多关注</TabsTrigger>
          <TabsTrigger value="sales">当前促销</TabsTrigger>
          <TabsTrigger value="tags">游戏标签</TabsTrigger>
        </TabsList>

        <TabsContent value="mostfollowed" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">排名</TableHead>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[180px]">关注数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostFollowedQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`most-followed-loading-${index}`}>
                          <TableCell>
                            <Skeleton className="h-5 w-14" />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-44" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    : mostFollowedRecords.length > 0
                      ? mostFollowedRecords.map((record) => {
                          const steamUrl = `https://store.steampowered.com/app/${record.app_id}`
                          return (
                            <TableRow
                              key={`most-followed-${record.app_id}-${record.rank}`}
                              className={cn(getRowClassName(record.rank))}
                            >
                              <TableCell>
                                <RankBadge rank={record.rank} />
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={steamUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-medium text-foreground transition hover:text-primary"
                                    >
                                      {record.name}
                                    </a>
                                    <a
                                      href={steamUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-muted-foreground transition hover:text-foreground"
                                      aria-label={`打开 ${record.name} Steam 商店`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    App ID: {record.app_id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                  <Heart className="h-4 w-4 text-rose-500" />
                                  <span>{formatNumber(record.follower_count)}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Pagination
            page={mostFollowedPage}
            pageSize={mostFollowedPageSize}
            total={mostFollowedTotal}
            onPageChange={setMostFollowedPage}
            onPageSizeChange={(value) => {
              setMostFollowedPageSize(value)
              setMostFollowedPage(1)
            }}
          />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[160px]">原价</TableHead>
                    <TableHead className="w-[160px]">促销价</TableHead>
                    <TableHead className="w-[120px]">折扣</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`sales-loading-${index}`}>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-44" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-14" />
                          </TableCell>
                        </TableRow>
                      ))
                    : salesRecords.length > 0
                      ? salesRecords.map((record) => {
                          const steamUrl = `https://store.steampowered.com/app/${record.app_id}`
                          return (
                            <TableRow key={`sales-${record.app_id}-${record.detected_at}`}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={steamUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-medium text-foreground transition hover:text-primary"
                                    >
                                      {record.name}
                                    </a>
                                    <a
                                      href={steamUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-muted-foreground transition hover:text-foreground"
                                      aria-label={`打开 ${record.name} Steam 商店`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    App ID: {record.app_id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground line-through">
                                {formatPrice(record.original_price, record.currency)}
                              </TableCell>
                              <TableCell className="font-semibold text-emerald-600">
                                {formatPrice(record.sale_price, record.currency)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="destructive"
                                  className="min-w-14 justify-center"
                                >
                                  -{Math.round(record.discount_percent)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Pagination
            page={salesPage}
            pageSize={salesPageSize}
            total={salesTotal}
            onPageChange={setSalesPage}
            onPageSizeChange={(value) => {
              setSalesPageSize(value)
              setSalesPage(1)
            }}
          />
        </TabsContent>

        <TabsContent value="tags">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={tagInput}
                    onChange={(event) => {
                      setTagInput(event.target.value)
                      if (tagError) {
                        setTagError("")
                      }
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="输入 Steam App ID，例如 570"
                    className="border-border/60 bg-background/60 pl-9"
                  />
                </div>
                <Button onClick={handleTagSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  搜索
                </Button>
              </div>

              {tagError ? (
                <p className="text-sm text-destructive">{tagError}</p>
              ) : null}

              {searchAppId === null ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  输入 App ID 后点击搜索，即可查看游戏标签
                </div>
              ) : tagsQuery.isLoading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <Skeleton key={`tag-loading-${index}`} className="h-8 w-24" />
                  ))}
                </div>
              ) : tagsQuery.isError ? (
                <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
                  <span>标签数据加载失败，请稍后重试。</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => tagsQuery.refetch()}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    重试
                  </Button>
                </div>
              ) : tagRecords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tagRecords.map((tag) => (
                    <Badge
                      key={`tag-${tag.tag_name}`}
                      variant="secondary"
                      className="flex items-center gap-2 rounded-full px-3 py-1"
                    >
                      <span>{tag.tag_name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatNumber(tag.votes)} 票
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  暂无数据
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
