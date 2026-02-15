import { type ReactNode } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Heart,
  Medal,
  Star,
  Tag,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useNavigate, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameDetail, useLatestStats } from "@/hooks/use-games"
import { usePlayerHistory, usePriceHistory, useFollowerHistory } from "@/hooks/use-steam-history"
import { useGameTags } from "@/hooks/use-steam-metadata"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number | null) =>
  typeof value === "number" ? numberFormatter.format(value) : "--"

const formatPrice = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  if (value === 0) {
    return "免费"
  }
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) {
    return "--"
  }
  return format(new Date(timestamp * 1000), "yyyy-MM-dd HH:mm", { locale: zhCN })
}

const formatChartDate = (timestamp: number) =>
  format(new Date(timestamp * 1000), "MM/dd", { locale: zhCN })

const getDiscountedPrice = (price: number, discountPercent: number) =>
  price * (1 - discountPercent / 100)

type ChartDatum = {
  date: number
  value: number
  discount?: number
}

type TooltipPayloadItem = {
  payload?: ChartDatum
}

type ChartTooltipProps = {
  active?: boolean
  payload?: readonly TooltipPayloadItem[]
}

function renderChartEmpty() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
      暂无历史数据
    </div>
  )
}

function renderChartLoading() {
  return <Skeleton className="h-[300px] w-full rounded-lg" />
}

function renderTrendTooltip(
  props: ChartTooltipProps,
  options: {
    label: string
    valueFormatter: (value: number) => string
    extra?: (datum: ChartDatum) => ReactNode
  }
) {
  if (!props.active || !props.payload || props.payload.length === 0) {
    return null
  }

  const datum = props.payload[0]?.payload
  if (!datum) {
    return null
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-foreground">{formatTimestamp(datum.date)}</div>
      <div className="mt-1 flex items-center justify-between gap-4 text-muted-foreground">
        <span>{options.label}</span>
        <span className="font-medium text-foreground">
          {options.valueFormatter(datum.value)}
        </span>
      </div>
      {options.extra ? <div className="mt-1">{options.extra(datum)}</div> : null}
    </div>
  )
}

function GameDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 shadow-sm lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`detail-info-${index}`} className="h-10 w-full" />
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`detail-stat-${index}`} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={`detail-tag-${index}`} className="h-6 w-20" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardContent className="p-6">{renderChartLoading()}</CardContent>
      </Card>
    </div>
  )
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const parsedGameId = id ? Number(id) : Number.NaN
  const isInvalidId =
    !id || Number.isNaN(parsedGameId) || !Number.isInteger(parsedGameId) || parsedGameId <= 0
  const gameId = isInvalidId ? null : parsedGameId

  const gameQuery = useGameDetail(gameId)
  const game = gameQuery.data?.data

  const appId = game?.app_id ?? null

  const statsQuery = useLatestStats(appId)
  const tagsQuery = useGameTags(appId)
  const playerHistoryQuery = usePlayerHistory(appId, { page: 1, page_size: 500 })
  const priceHistoryQuery = usePriceHistory(appId, { page: 1, page_size: 500 })
  const followerHistoryQuery = useFollowerHistory(appId, { page: 1, page_size: 500 })

  const stats = statsQuery.data?.data
  const tags = tagsQuery.data?.data ?? []
  const playerHistoryData = playerHistoryQuery.data?.data ?? []
  const priceHistoryData = priceHistoryQuery.data?.data ?? []
  const followerHistoryData = followerHistoryQuery.data?.data ?? []

  const steamStoreUrl = appId
    ? `https://store.steampowered.com/app/${appId}`
    : undefined

  const playerChartData: ChartDatum[] = [...playerHistoryData]
    .sort((left, right) => left.recorded_at - right.recorded_at)
    .map((point) => ({
      date: point.recorded_at,
      value: point.player_count,
    }))

  const priceChartData = [...priceHistoryData]
    .sort((left, right) => left.recorded_at - right.recorded_at)
    .map((point) => ({
      date: point.recorded_at,
      value: point.price,
      discount: point.discount_percent,
      discountValue: point.discount_percent > 0 ? point.price : null,
    }))

  const followerChartData: ChartDatum[] = [...followerHistoryData]
    .sort((left, right) => left.recorded_at - right.recorded_at)
    .map((point) => ({
      date: point.recorded_at,
      value: point.follower_count,
    }))

  if (isInvalidId) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </Button>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            无效的游戏 ID
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameQuery.isLoading) {
    return <GameDetailSkeleton />
  }

  if (gameQuery.isError) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </Button>
        <Card className="border-destructive/40 bg-destructive/10 shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-destructive">游戏信息加载失败</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => gameQuery.refetch()}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </Button>
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            未找到游戏信息
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="返回上一页"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{game.name}</h1>
            <p className="text-sm text-muted-foreground">App ID: {game.app_id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "border border-transparent",
              game.coming_soon
                ? "bg-amber-500/15 text-amber-400"
                : "bg-emerald-500/15 text-emerald-400"
            )}
          >
            {game.coming_soon ? "即将发售" : "已发售"}
          </Badge>
          {game.store_url && steamStoreUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={steamStoreUrl} target="_blank" rel="noreferrer">
                Steam 商店
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>基础信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/30">
              {game.header_image ? (
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="aspect-video h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
                  暂无封面
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">开发商</p>
                <p className="mt-1 text-sm font-medium">{game.developers || "--"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">发行商</p>
                <p className="mt-1 text-sm font-medium">{game.publishers || "--"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">发行日期</p>
                <p className="mt-1 text-sm font-medium">{game.release_date || "--"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">类型</p>
                <p className="mt-1 text-sm font-medium">{game.type || "--"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">分类</p>
                <p className="mt-1 text-sm font-medium">{game.categories || "--"}</p>
              </div>
            </div>

            {game.steamdb_synced ? (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    SteamDB 扩展数据
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">DLC 数量</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatNumber(game.dlc_count)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">成就数量</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatNumber(game.achievement_count)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">关注数</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatNumber(game.follower_count)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">关注峰值</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatNumber(game.follower_peak)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">玩家峰值</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatNumber(game.player_peak)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" />
                        官方网站
                      </p>
                      <p className="mt-1 truncate text-sm font-medium">
                        {game.offcial_website || "--"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">简介</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {game.short_description || "暂无简介"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle>实时统计</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`stats-loading-${index}`} className="h-11 w-full" />
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-sky-400" />
                      当前在线
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatNumber(stats.current_players)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4 text-rose-400" />
                      关注数
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatNumber(stats.followers)}
                    </span>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-400" />
                        评分
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {typeof stats.review_score === "number"
                          ? `${Math.round(stats.review_score)}%`
                          : "--"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.review_score_desc || "暂无描述"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="h-4 w-4 text-emerald-400" />
                        价格
                      </div>
                      {stats.discount_percent > 0 && stats.price > 0 ? (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(stats.price)}
                          </p>
                          <p className="text-sm font-semibold text-emerald-400">
                            {formatPrice(
                              getDiscountedPrice(stats.price, stats.discount_percent)
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(stats.price)}
                        </span>
                      )}
                    </div>
                    {stats.discount_percent > 0 ? (
                      <Badge
                        variant="secondary"
                        className="mt-1 border-transparent bg-rose-500/15 text-[10px] text-rose-400"
                      >
                        -{Math.round(stats.discount_percent)}%
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {stats.wishlist_rank > 0 || stats.selling_rank > 0 ? (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {stats.wishlist_rank > 0 ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="h-4 w-4 text-violet-400" />
                            愿望单排名
                          </span>
                          <span className="font-semibold text-foreground">
                            #{formatNumber(stats.wishlist_rank)}
                          </span>
                        </div>
                      ) : null}
                      {stats.selling_rank > 0 ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Medal className="h-4 w-4 text-cyan-400" />
                            畅销排名
                          </span>
                          <span className="font-semibold text-foreground">
                            #{formatNumber(stats.selling_rank)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                <Separator />
                <div className="text-xs text-muted-foreground">
                  数据采集时间：{formatTimestamp(stats.collected_at)}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
                暂无统计数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            游戏标签
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tagsQuery.isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={`tag-loading-${index}`} className="h-6 w-20" />
              ))}
            </div>
          ) : tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={`tag-${tag.tag_name}-${index}`}
                  variant="secondary"
                  className="gap-1 border border-border/60 bg-secondary/70"
                >
                  <span>{tag.tag_name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatNumber(tag.votes)}
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
              暂无标签数据
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            历史趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="players" className="space-y-4">
            <TabsList>
              <TabsTrigger value="players">玩家趋势</TabsTrigger>
              <TabsTrigger value="price">价格趋势</TabsTrigger>
              <TabsTrigger value="followers">关注趋势</TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-0">
              {playerHistoryQuery.isLoading ? (
                renderChartLoading()
              ) : playerChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={playerChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value: number) => formatNumber(value)}
                      width={72}
                    />
                    <RechartsTooltip
                      content={(props) =>
                        renderTrendTooltip(props as ChartTooltipProps, {
                          label: "玩家数",
                          valueFormatter: (value) => `${formatNumber(value)} 人`,
                        })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill="hsl(200, 80%, 60%)"
                      fillOpacity={0.25}
                      stroke="hsl(200, 80%, 60%)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                renderChartEmpty()
              )}
            </TabsContent>

            <TabsContent value="price" className="mt-0">
              {priceHistoryQuery.isLoading ? (
                renderChartLoading()
              ) : priceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value: number) => formatPrice(value)}
                      width={80}
                    />
                    <RechartsTooltip
                      content={(props) =>
                        renderTrendTooltip(props as ChartTooltipProps, {
                          label: "价格",
                          valueFormatter: (value) => formatPrice(value),
                          extra: (datum) =>
                            typeof datum.discount === "number" && datum.discount > 0 ? (
                              <span className="text-[11px] text-rose-400">
                                折扣 {Math.round(datum.discount)}%
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">无折扣</span>
                            ),
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(150, 60%, 50%)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="linear"
                      dataKey="discountValue"
                      stroke="transparent"
                      connectNulls={false}
                      dot={{
                        r: 3,
                        fill: "hsl(0, 75%, 60%)",
                        stroke: "hsl(0, 75%, 60%)",
                      }}
                      activeDot={{
                        r: 5,
                        fill: "hsl(0, 75%, 60%)",
                        stroke: "hsl(0, 75%, 60%)",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                renderChartEmpty()
              )}
            </TabsContent>

            <TabsContent value="followers" className="mt-0">
              {followerHistoryQuery.isLoading ? (
                renderChartLoading()
              ) : followerChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={followerChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value: number) => formatNumber(value)}
                      width={72}
                    />
                    <RechartsTooltip
                      content={(props) =>
                        renderTrendTooltip(props as ChartTooltipProps, {
                          label: "关注数",
                          valueFormatter: (value) => `${formatNumber(value)} 人`,
                        })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill="hsl(340, 70%, 60%)"
                      fillOpacity={0.25}
                      stroke="hsl(340, 70%, 60%)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                renderChartEmpty()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
