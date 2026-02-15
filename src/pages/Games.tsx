import { useEffect, useMemo, useState } from "react"
import { ExternalLink, LayoutGrid, List, Search } from "lucide-react"
import { Link } from "react-router-dom"

import GameCard from "@/components/common/GameCard"
import Pagination from "@/components/common/Pagination"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGames } from "@/hooks/use-games"
import { cn } from "@/lib/utils"
import type { GamesQueryParams } from "@/types"

const placeholderItems = Array.from({ length: 8 })
const listSkeletonItems = Array.from({ length: 6 })
const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const formatPrice = (value: number) => {
  if (value === 0) {
    return "免费"
  }
  const fractionDigits = Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

const getDiscountedPrice = (price: number, discountPercent: number) =>
  price * (1 - discountPercent / 100)

const formatReviewScore = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return `${Math.round(value)}%`
}

const getScoreTone = (score: number) => {
  if (score >= 70) {
    return "bg-emerald-500"
  }
  if (score >= 40) {
    return "bg-amber-400"
  }
  return "bg-slate-400"
}

export default function Games() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchText, setSearchText] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [releaseStatus, setReleaseStatus] =
    useState<GamesQueryParams["release_status"]>("all")
  const [gameType, setGameType] = useState("all")
  const [sortBy, setSortBy] = useState<GamesQueryParams["sort_by"]>("created_at")
  const [sortOrder, setSortOrder] =
    useState<GamesQueryParams["sort_order"]>("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchText.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchText])

  const params = useMemo<GamesQueryParams>(
    () => ({
      page,
      page_size: pageSize,
      name: debouncedSearch || undefined,
      release_status: releaseStatus,
      type: gameType === "all" ? undefined : gameType,
      sort_by: sortBy,
      sort_order: sortOrder,
      with_stats: true,
    }),
    [page, pageSize, debouncedSearch, releaseStatus, gameType, sortBy, sortOrder]
  )

  const query = useGames(params)
  const games = useMemo(() => query.data?.data ?? [], [query.data?.data])
  const total = query.data?.pagination.total ?? 0

  const typeOptions = useMemo(() => {
    const defaults = ["RPG", "动作", "冒险", "策略", "模拟", "独立"]
    const dynamic = games
      .map((game) => game.type)
      .filter((value): value is string => Boolean(value))
    return Array.from(new Set([...defaults, ...dynamic]))
  }, [games])

  const renderPrice = (price?: number, discountPercent?: number) => {
    if (typeof price !== "number") {
      return <span className="text-muted-foreground">--</span>
    }
    if (price === 0) {
      return <span className="text-emerald-400">免费</span>
    }
    if (typeof discountPercent === "number" && discountPercent > 0) {
      const discounted = getDiscountedPrice(price, discountPercent)
      return (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(price)}
          </span>
          <span className="text-xs font-semibold text-emerald-500">
            {formatPrice(discounted)}
          </span>
        </div>
      )
    }
    return <span>{formatPrice(price)}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">游戏库</h1>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value)
              setPage(1)
            }}
            placeholder="搜索游戏名称..."
            className="border-border/60 bg-background/60 pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={releaseStatus}
            onValueChange={(value) => {
              setReleaseStatus(value as GamesQueryParams["release_status"])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px] border-border/60 bg-background/60">
              <SelectValue placeholder="发售状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部发售</SelectItem>
              <SelectItem value="released">已发售</SelectItem>
              <SelectItem value="coming_soon">即将发售</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={gameType}
            onValueChange={(value) => {
              setGameType(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px] border-border/60 bg-background/60">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={`type-${option}`} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value as GamesQueryParams["sort_by"])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px] border-border/60 bg-background/60">
              <SelectValue placeholder="排序字段" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">创建时间</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="review_score">评分</SelectItem>
              <SelectItem value="followers">关注数</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as GamesQueryParams["sort_order"])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[110px] border-border/60 bg-background/60">
              <SelectValue placeholder="排序方向" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">降序</SelectItem>
              <SelectItem value="asc">升序</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            size="icon"
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>

      {query.isError ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
          <span>游戏列表加载失败，请稍后重试。</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            重试
          </Button>
        </div>
      ) : view === "grid" ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {query.isLoading
            ? placeholderItems.map((_, index) => (
                <GameCard key={`game-card-${index}`} loading layout="grid" />
              ))
            : games.length > 0
              ? games.map((game) => (
                  <GameCard
                    key={`game-${game.id}`}
                    name={game.name}
                    developers={game.developers}
                    publishers={game.publishers}
                    type={game.type}
                    headerImage={game.header_image}
                    price={game.price}
                    discountPercent={game.discount_percent}
                    reviewScore={game.review_score}
                    followers={game.followers}
                    currentPlayers={game.current_players}
                    comingSoon={game.coming_soon}
                    storeUrl={game.store_url}
                    detailUrl={`/games/app/${game.app_id}`}
                    layout="grid"
                  />
                ))
              : (
                  <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
                    暂无游戏数据
                  </div>
                )}
        </div>
      ) : (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="pt-4">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[120px] sm:table-cell">
                    封面
                  </TableHead>
                  <TableHead>游戏</TableHead>
                  <TableHead className="w-[100px]">状态</TableHead>
                  <TableHead className="w-[140px]">评分</TableHead>
                  <TableHead className="hidden w-[120px] lg:table-cell">
                    关注数
                  </TableHead>
                  <TableHead className="hidden w-[120px] lg:table-cell">
                    在线人数
                  </TableHead>
                  <TableHead className="hidden w-[120px] lg:table-cell">
                    价格
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading
                  ? listSkeletonItems.map((_, index) => (
                      <TableRow key={`loading-row-${index}`}>
                        <TableCell className="hidden sm:table-cell">
                          <Skeleton className="h-12 w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  : games.length > 0
                    ? games.map((game) => {
                        const score = Math.max(
                          0,
                          Math.min(100, game.review_score ?? 0)
                        )
                        return (
                          <TableRow key={`game-row-${game.id}`}>
                            <TableCell className="hidden sm:table-cell">
                              <div className="h-12 w-20 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                {game.header_image ? (
                                  <img
                                    src={game.header_image}
                                    alt={game.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                    暂无封面
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/games/app/${game.app_id}`}
                                    className="font-medium text-foreground transition hover:text-primary"
                                  >
                                    {game.name}
                                  </Link>
                                  {game.store_url ? (
                                    <a
                                      href={game.store_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-muted-foreground transition hover:text-foreground"
                                      aria-label={`打开 ${game.name} 商店`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  ) : null}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {game.developers
                                    ? `开发商 ${game.developers}`
                                    : "开发商 --"}
                                  {game.publishers
                                    ? ` · 发行商 ${game.publishers}`
                                    : ""}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  类型 {game.type || "--"} · 发售{" "}
                                  {game.release_date || "--"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "border border-transparent text-[10px]",
                                  game.coming_soon
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-emerald-500/15 text-emerald-400"
                                )}
                              >
                                {game.coming_soon ? "即将发售" : "已发售"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatReviewScore(game.review_score)}
                                </span>
                                <div className="h-1.5 w-24 rounded-full bg-muted/40">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      getScoreTone(score)
                                    )}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {formatNumber(game.followers)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {formatNumber(game.current_players)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {renderPrice(
                                game.price,
                                game.discount_percent
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            暂无游戏数据
                          </TableCell>
                        </TableRow>
                      )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
        }}
      />
    </div>
  )
}
