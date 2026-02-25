import { type ReactNode, useMemo, useState } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  Apple,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Gamepad2,
  Globe,
  Heart,
  Medal,
  MessageSquare,
  Monitor,
  Newspaper,
  ShoppingCart,
  Star,
  Tag,
  Terminal,
  ThumbsDown,
  ThumbsUp,
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
import { useGameByAppId, useLatestStats } from "@/hooks/use-games"
import { usePlayerHistory, usePriceHistory, useFollowerHistory } from "@/hooks/use-steam-history"
import { useGameTags } from "@/hooks/use-steam-metadata"
import { useNewsByAppId } from "@/hooks/use-steam-news"
import { useSteamReviewsByAppId } from "@/hooks/use-steam-reviews"
import { useIGDBByAppId } from "@/hooks/use-igdb"
import { useDealsByAppId } from "@/hooks/use-deals"
import { useHLTBByAppId } from "@/hooks/use-hltb"
import { useSteamSpyByAppId } from "@/hooks/use-steamspy"
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

const getMetacriticBadgeStyle = (score: number) => {
  if (score >= 75) {
    return "bg-emerald-500/15 text-emerald-400"
  }
  if (score >= 50) {
    return "bg-amber-500/15 text-amber-400"
  }
  return "bg-rose-500/15 text-rose-400"
}

const getProtonDBBadgeStyle = (tier?: string) => {
  switch (tier?.toLowerCase()) {
    case "platinum":
      return "bg-emerald-500/15 text-emerald-400"
    case "gold":
      return "bg-amber-500/15 text-amber-400"
    case "silver":
      return "bg-slate-500/15 text-slate-300"
    case "bronze":
      return "bg-orange-500/15 text-orange-400"
    case "borked":
      return "bg-rose-500/15 text-rose-400"
    default:
      return "bg-secondary/70 text-secondary-foreground"
  }
}

const formatTier = (tier: string) =>
  tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()

const stripHTML = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replaceAll("&nbsp;", " ").replace(/\s+/g, " ").trim()

type PlatformPayload = {
  windows?: boolean
  mac?: boolean
  linux?: boolean
}

type ScreenshotPayload = {
  id?: number
  path_thumbnail?: string
  path_full?: string
}

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

const formatHours = (value?: number | null) =>
  typeof value === "number" ? `${value.toFixed(1)} 小时` : "--"

const formatOwners = (min?: number, max?: number) => {
  if (typeof min !== "number" || typeof max !== "number") return "--"
  const toWan = (n: number) => (n / 10000).toFixed(0)
  return `${toWan(min)}万 - ${toWan(max)}万`
}

const minutesToHours = (minutes?: number) =>
  typeof minutes === "number" ? `${(minutes / 60).toFixed(1)} 小时` : "--"

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
  const { appId: appIdParam } = useParams<{ appId: string }>()
  const navigate = useNavigate()

  const parsedGameId = appIdParam ? Number(appIdParam) : Number.NaN
  const isInvalidId =
    !appIdParam || Number.isNaN(parsedGameId) || !Number.isInteger(parsedGameId) || parsedGameId <= 0
  const appId = isInvalidId ? null : parsedGameId

  const gameQuery = useGameByAppId(appId)
  const game = gameQuery.data?.data

  const statsQuery = useLatestStats(appId)
  const tagsQuery = useGameTags(appId)
  const playerHistoryQuery = usePlayerHistory(appId, { page: 1, page_size: 10000 })
  const priceHistoryQuery = usePriceHistory(appId, { page: 1, page_size: 10000 })
  const followerHistoryQuery = useFollowerHistory(appId, { page: 1, page_size: 10000 })

  const stats = statsQuery.data?.data
  const tags = tagsQuery.data?.data ?? []
  const playerHistoryData = playerHistoryQuery.data?.data ?? []
  const priceHistoryData = priceHistoryQuery.data?.data ?? []
  const followerHistoryData = followerHistoryQuery.data?.data ?? []
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const hltbQuery = useHLTBByAppId(appId)
  const igdbQuery = useIGDBByAppId(appId)
  const steamSpyQuery = useSteamSpyByAppId(appId)
  const newsQuery = useNewsByAppId(appId, 1, 10)
  const reviewsQuery = useSteamReviewsByAppId(appId, 1, 10)
  const dealsQuery = useDealsByAppId(appId, 1, 20)

  const hltbData = hltbQuery.data?.data
  const igdbData = igdbQuery.data?.data
  const steamSpyData = steamSpyQuery.data?.data?.[0]
  const newsItems = newsQuery.data?.data ?? []
  const reviewItems = reviewsQuery.data?.data ?? []
  const dealItems = dealsQuery.data?.data ?? []

  const igdbGenres = useMemo(() => {
    if (!igdbData?.genres_json) return []
    try {
      const parsed = JSON.parse(igdbData.genres_json) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (g): g is { name: string } =>
          g && typeof g === "object" && typeof (g as Record<string, unknown>).name === "string",
      )
    } catch {
      return []
    }
  }, [igdbData?.genres_json])

  const igdbThemes = useMemo(() => {
    if (!igdbData?.themes_json) return []
    try {
      const parsed = JSON.parse(igdbData.themes_json) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (t): t is { name: string } =>
          t && typeof t === "object" && typeof (t as Record<string, unknown>).name === "string",
      )
    } catch {
      return []
    }
  }, [igdbData?.themes_json])

  const platforms = useMemo<PlatformPayload | null>(() => {
    if (!game?.platforms) {
      return null
    }
    try {
      const parsed = JSON.parse(game.platforms) as PlatformPayload
      return {
        windows: Boolean(parsed.windows),
        mac: Boolean(parsed.mac),
        linux: Boolean(parsed.linux),
      }
    } catch {
      return null
    }
  }, [game?.platforms])

  const screenshots = useMemo<ScreenshotPayload[]>(() => {
    if (!game?.screenshots_json) {
      return []
    }
    try {
      const parsed = JSON.parse(game.screenshots_json) as unknown
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null
          }
          const screenshotItem = item as Record<string, unknown>
          const screenshot: ScreenshotPayload = {}
          if (typeof screenshotItem.id === "number") {
            screenshot.id = screenshotItem.id
          }
          if (typeof screenshotItem.path_thumbnail === "string") {
            screenshot.path_thumbnail = screenshotItem.path_thumbnail
          }
          if (typeof screenshotItem.path_full === "string") {
            screenshot.path_full = screenshotItem.path_full
          }
          return screenshot
        })
        .filter((item): item is ScreenshotPayload =>
          item !== null && Boolean(item.path_thumbnail || item.path_full),
        )
    } catch {
      return []
    }
  }, [game?.screenshots_json])

  const supportedLanguages = useMemo(() => {
    if (!game?.supported_languages) {
      return []
    }
    return game.supported_languages
      .split(/[,\n|，]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }, [game?.supported_languages])

  const aboutText = useMemo(() => {
    if (!game?.about_the_game) {
      return ""
    }
    return stripHTML(game.about_the_game)
  }, [game?.about_the_game])

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
            无效的 App ID
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
          {game.protondb_tier ? (
            <Badge
              variant="secondary"
              className={cn(
                "border border-transparent",
                getProtonDBBadgeStyle(game.protondb_tier),
              )}
            >
              ProtonDB {formatTier(game.protondb_tier)}
            </Badge>
          ) : null}
          {typeof game.metacritic_score === "number" ? (
            <Badge
              variant="secondary"
              className={cn(
                "border border-transparent",
                getMetacriticBadgeStyle(game.metacritic_score),
              )}
            >
              Metacritic {game.metacritic_score}
            </Badge>
          ) : null}
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
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">平台支持</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {platforms?.windows ? (
                    <Badge variant="secondary" className="gap-1 border border-border/60 bg-secondary/70">
                      <Monitor className="h-3.5 w-3.5" />
                      Windows
                    </Badge>
                  ) : null}
                  {platforms?.mac ? (
                    <Badge variant="secondary" className="gap-1 border border-border/60 bg-secondary/70">
                      <Apple className="h-3.5 w-3.5" />
                      macOS
                    </Badge>
                  ) : null}
                  {platforms?.linux ? (
                    <Badge variant="secondary" className="gap-1 border border-border/60 bg-secondary/70">
                      <Terminal className="h-3.5 w-3.5" />
                      Linux
                    </Badge>
                  ) : null}
                  {!platforms?.windows && !platforms?.mac && !platforms?.linux ? (
                    <span className="text-sm font-medium text-muted-foreground">--</span>
                  ) : null}
                </div>
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

            {supportedLanguages.length > 0 ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">支持语言</p>
                  <div className="flex flex-wrap gap-2">
                    {supportedLanguages.map((language, index) => (
                      <Badge
                        key={`supported-language-${language}-${index}`}
                        variant="secondary"
                        className="border border-border/60 bg-secondary/70"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {aboutText ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">关于游戏</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {isAboutExpanded || aboutText.length <= 420
                      ? aboutText
                      : `${aboutText.slice(0, 420)}...`}
                  </p>
                  {aboutText.length > 420 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAboutExpanded((prev) => !prev)}
                      className="h-8 px-2 text-xs text-muted-foreground"
                    >
                      {isAboutExpanded ? (
                        <>
                          收起
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          展开更多
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}

            {screenshots.length > 0 ? (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">游戏截图</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {screenshots.map((screenshot, index) => {
                      const imageUrl = screenshot.path_thumbnail ?? screenshot.path_full
                      const fullImageUrl = screenshot.path_full ?? screenshot.path_thumbnail
                      if (!imageUrl) {
                        return null
                      }
                      return (
                        <a
                          key={`screenshot-${screenshot.id ?? index}`}
                          href={fullImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-md border border-border/60 bg-muted/20 transition hover:border-primary/40"
                        >
                          <img
                            src={imageUrl}
                            alt={`${game.name} screenshot ${index + 1}`}
                            className="aspect-video h-full w-full object-cover"
                          />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
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

      {/* HLTB + IGDB + SteamSpy 信息栏 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              通关时长
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {hltbQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`hltb-skeleton-${i}`} className="h-8 w-full" />
                ))}
              </div>
            ) : hltbData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">主线</span>
                  <span className="text-sm font-medium">{formatHours(hltbData.main_story_hours)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">主线+额外</span>
                  <span className="text-sm font-medium">{formatHours(hltbData.main_extra_hours)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">完美通关</span>
                  <span className="text-sm font-medium">
                    {formatHours(hltbData.completionist_hours)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">所有风格</span>
                  <span className="text-sm font-medium">{formatHours(hltbData.all_styles_hours)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
                暂无通关时长数据
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="h-4 w-4 text-primary" />
              IGDB 信息
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {igdbQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={`igdb-skeleton-${i}`} className="h-8 w-full" />
                ))}
              </div>
            ) : igdbData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {typeof igdbData.rating === "number" ? (
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">用户评分</span>
                      <p className="text-sm font-medium">{Math.round(igdbData.rating)}</p>
                    </div>
                  ) : null}
                  {typeof igdbData.aggregated_rating === "number" ? (
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">媒体评分</span>
                      <p className="text-sm font-medium">
                        {Math.round(igdbData.aggregated_rating)}
                      </p>
                    </div>
                  ) : null}
                </div>
                {igdbGenres.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">流派</p>
                    <div className="flex flex-wrap gap-1">
                      {igdbGenres.map((g, i) => (
                        <Badge
                          key={`igdb-genre-${i}`}
                          variant="secondary"
                          className="border border-border/60 bg-secondary/70 text-xs"
                        >
                          {g.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {igdbThemes.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">主题</p>
                    <div className="flex flex-wrap gap-1">
                      {igdbThemes.map((t, i) => (
                        <Badge
                          key={`igdb-theme-${i}`}
                          variant="secondary"
                          className="border border-border/60 bg-secondary/70 text-xs"
                        >
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
                暂无 IGDB 数据
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              SteamSpy 数据
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {steamSpyQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`steamspy-skeleton-${i}`} className="h-8 w-full" />
                ))}
              </div>
            ) : steamSpyData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">所有者范围</span>
                  <span className="text-sm font-medium">
                    {formatOwners(steamSpyData.owners_min, steamSpyData.owners_max)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">平均游戏时长</span>
                  <span className="text-sm font-medium">
                    {minutesToHours(steamSpyData.average_playtime)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">中位游戏时长</span>
                  <span className="text-sm font-medium">
                    {minutesToHours(steamSpyData.median_playtime)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">CCU</span>
                  <span className="text-sm font-medium">{formatNumber(steamSpyData.ccu)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
                暂无 SteamSpy 数据
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

      {/* 数据详情 Tabs */}
      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            数据详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="news" className="space-y-4">
            <TabsList>
              <TabsTrigger value="news">
                <Newspaper className="mr-1 h-3.5 w-3.5" />
                新闻
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <MessageSquare className="mr-1 h-3.5 w-3.5" />
                评测
              </TabsTrigger>
              <TabsTrigger value="deals">
                <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                价格比较
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="mt-0">
              {newsQuery.isLoading ? (
                renderChartLoading()
              ) : newsItems.length > 0 ? (
                <div className="space-y-3">
                  {newsItems.map((item) => (
                    <div
                      key={`news-${item.id}`}
                      className="rounded-lg border border-border/60 bg-muted/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-foreground transition hover:text-primary"
                        >
                          {item.title}
                        </a>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        {item.author ? <span>{item.author}</span> : null}
                        <span>{formatTimestamp(item.published_at)}</span>
                      </div>
                      {item.contents ? (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {stripHTML(item.contents).slice(0, 150)}
                          {stripHTML(item.contents).length > 150 ? "..." : ""}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
                  暂无新闻数据
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              {reviewsQuery.isLoading ? (
                renderChartLoading()
              ) : reviewItems.length > 0 ? (
                <div className="space-y-3">
                  {reviewItems.map((item) => (
                    <div
                      key={`review-${item.id}`}
                      className="rounded-lg border border-border/60 bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-2">
                        {item.voted_up ? (
                          <ThumbsUp className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-rose-400" />
                        )}
                        <Badge
                          variant="secondary"
                          className="border border-border/60 bg-secondary/70 text-xs"
                        >
                          {item.language}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          游戏时长: {minutesToHours(item.playtime_forever)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.review_text.slice(0, 200)}
                        {item.review_text.length > 200 ? "..." : ""}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatNumber(item.votes_up)}
                        </span>
                        <span>{formatTimestamp(item.review_created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
                  暂无评测数据
                </div>
              )}
            </TabsContent>

            <TabsContent value="deals" className="mt-0">
              {dealsQuery.isLoading ? (
                renderChartLoading()
              ) : dealItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-xs text-muted-foreground">
                        <th className="pb-2 pr-4 text-left font-medium">商店</th>
                        <th className="pb-2 pr-4 text-right font-medium">当前价格</th>
                        <th className="pb-2 pr-4 text-right font-medium">原价</th>
                        <th className="pb-2 pr-4 text-right font-medium">折扣</th>
                        <th className="pb-2 pr-4 text-right font-medium">历史最低</th>
                        <th className="pb-2 text-right font-medium">链接</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealItems.map((deal) => (
                        <tr key={`deal-${deal.id}`} className="border-b border-border/30">
                          <td className="py-2 pr-4 font-medium">{deal.store}</td>
                          <td className="py-2 pr-4 text-right text-emerald-400">
                            ${deal.current_price.toFixed(2)}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            ${deal.regular_price.toFixed(2)}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {deal.discount_percent > 0 ? (
                              <Badge
                                variant="secondary"
                                className="border-transparent bg-rose-500/15 text-[10px] text-rose-400"
                              >
                                -{Math.round(deal.discount_percent)}%
                              </Badge>
                            ) : "--"}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            ${deal.historical_low.toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <a
                              href={deal.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary transition hover:text-primary/80"
                            >
                              <ExternalLink className="inline h-3.5 w-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
                  暂无价格数据
                </div>
              )}
            </TabsContent>
          </Tabs>
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
