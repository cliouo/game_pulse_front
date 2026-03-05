import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ExternalLink, Heart } from "lucide-react"
import { Link } from "react-router-dom"

import Pagination from "@/components/common/Pagination"
import RankingTable from "@/components/common/RankingTable"
import RankBadge from "@/components/rankings/RankBadge"
import TopPlayersTable from "@/components/rankings/TopPlayersTable"
import { Card, CardContent } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTopSelling } from "@/hooks/use-rankings"
import { useTopPlayers } from "@/hooks/use-stats"
import {
  useMostFollowed,
  useMostPlayed,
  useMostWishlisted,
  useTopRated,
} from "@/hooks/use-steam-metadata"
import { cn } from "@/lib/utils"

const limitOptions = ["10", "20", "50", "100"]

const steamdbTabs = new Set(["mostfollowed", "toprated", "wishlist", "mostplayed"])

const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number) => {
  if (typeof value !== "number") return "--"
  return numberFormatter.format(value)
}

const formatRatingPercent = (value?: number) => {
  if (typeof value !== "number") return "--"
  return `${(value * 100).toFixed(2)}%`
}

const formatRecordTime = (value?: string) => {
  if (!value) return "暂无更新"
  const parsed = parseISO(value)
  if (isValid(parsed)) return format(parsed, "yyyy年MM月dd日 HH:mm", { locale: zhCN })
  const fallback = new Date(value)
  if (isValid(fallback)) return format(fallback, "yyyy年MM月dd日 HH:mm", { locale: zhCN })
  return "暂无更新"
}

const formatTimestamp = (value?: number) => {
  if (!value) return "暂无更新"
  return format(new Date(value * 1000), "yyyy年MM月dd日 HH:mm", { locale: zhCN })
}

const getRowClassName = (rank: number) => {
  if (rank === 1)
    return "bg-gradient-to-r from-amber-200/70 via-amber-50/50 to-transparent hover:bg-transparent hover:brightness-95"
  if (rank === 2)
    return "bg-gradient-to-r from-slate-200/70 via-slate-50/50 to-transparent hover:bg-transparent hover:brightness-95"
  if (rank === 3)
    return "bg-gradient-to-r from-amber-300/60 via-orange-50/40 to-transparent hover:bg-transparent hover:brightness-95"
  return ""
}

const skeletonRows = Array.from({ length: 8 })

export default function Rankings() {
  const [limit, setLimit] = useState("10")
  const [activeTab, setActiveTab] = useState("topselling")
  const limitValue = Number(limit) || 10

  // Steam 原生排行
  const topSellingQuery = useTopSelling(limitValue)
  const topPlayersQuery = useTopPlayers(limitValue)

  const topSellingRecords = topSellingQuery.data?.data ?? []
  const topPlayersRecords = topPlayersQuery.data?.data ?? []

  // SteamDB 排行
  const [mostFollowedPage, setMostFollowedPage] = useState(1)
  const [mostFollowedPageSize, setMostFollowedPageSize] = useState(20)
  const [topRatedPage, setTopRatedPage] = useState(1)
  const [topRatedPageSize, setTopRatedPageSize] = useState(20)
  const [mostWishlistedPage, setMostWishlistedPage] = useState(1)
  const [mostWishlistedPageSize, setMostWishlistedPageSize] = useState(20)
  const [mostPlayedPage, setMostPlayedPage] = useState(1)
  const [mostPlayedPageSize, setMostPlayedPageSize] = useState(20)

  const mostFollowedQuery = useMostFollowed(mostFollowedPage, mostFollowedPageSize)
  const topRatedQuery = useTopRated(topRatedPage, topRatedPageSize)
  const mostWishlistedQuery = useMostWishlisted(mostWishlistedPage, mostWishlistedPageSize)
  const mostPlayedQuery = useMostPlayed(mostPlayedPage, mostPlayedPageSize)

  const mostFollowedRecords = mostFollowedQuery.data?.data ?? []
  const mostFollowedTotal = mostFollowedQuery.data?.pagination.total ?? 0
  const topRatedRecords = topRatedQuery.data?.data ?? []
  const topRatedTotal = topRatedQuery.data?.pagination.total ?? 0
  const mostWishlistedRecords = mostWishlistedQuery.data?.data ?? []
  const mostWishlistedTotal = mostWishlistedQuery.data?.pagination.total ?? 0
  const mostPlayedRecords = mostPlayedQuery.data?.data ?? []
  const mostPlayedTotal = mostPlayedQuery.data?.pagination.total ?? 0

  // 副标题：记录时间
  const isSteamdbTab = steamdbTabs.has(activeTab)

  const getSubtitle = () => {
    if (activeTab === "topselling") return formatRecordTime(topSellingRecords[0]?.record_time)
    if (activeTab === "wishlist") return formatTimestamp(mostWishlistedRecords[0]?.recorded_at)
    if (activeTab === "players") return formatRecordTime(topPlayersRecords[0]?.collected_at)
    if (activeTab === "mostfollowed") return formatTimestamp(mostFollowedRecords[0]?.recorded_at)
    if (activeTab === "toprated") return formatTimestamp(topRatedRecords[0]?.recorded_at)
    if (activeTab === "mostplayed") return formatTimestamp(mostPlayedRecords[0]?.recorded_at)
    return "暂无更新"
  }

  const subtitleLoading =
    (activeTab === "topselling" && topSellingQuery.isLoading) ||
    (activeTab === "wishlist" && mostWishlistedQuery.isLoading) ||
    (activeTab === "players" && topPlayersQuery.isLoading) ||
    (activeTab === "mostfollowed" && mostFollowedQuery.isLoading) ||
    (activeTab === "toprated" && topRatedQuery.isLoading) ||
    (activeTab === "mostplayed" && mostPlayedQuery.isLoading)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Steam 排行榜</h1>
          {subtitleLoading ? (
            <Skeleton className="h-4 w-44" />
          ) : (
            <p className="text-sm text-muted-foreground">
              数据记录时间: {getSubtitle()}
            </p>
          )}
        </div>
        {!isSteamdbTab && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">显示数量</span>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-[120px] border-border/60 bg-background/60">
                <SelectValue placeholder="Top N" />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    Top {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="topselling">畅销榜</TabsTrigger>
          <TabsTrigger value="wishlist">愿望单榜</TabsTrigger>
          <TabsTrigger value="players">在线人数榜</TabsTrigger>
          <TabsTrigger value="mostfollowed">最多关注</TabsTrigger>
          <TabsTrigger value="toprated">最高评分</TabsTrigger>
          <TabsTrigger value="mostplayed">最多游玩</TabsTrigger>
        </TabsList>

        {/* Steam 原生排行 */}
        <TabsContent value="topselling">
          <RankingTable
            records={topSellingRecords}
            loading={topSellingQuery.isLoading}
            count={limitValue}
          />
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">排名</TableHead>
                    <TableHead className="hidden w-[100px] sm:table-cell">封面</TableHead>
                    <TableHead>游戏名称</TableHead>
                    <TableHead className="w-[180px]">关注数</TableHead>
                    <TableHead className="w-[160px]">7日增长</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostWishlistedQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`wl-sk-${index}`}>
                          <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-16" /></TableCell>
                          <TableCell><div className="space-y-2"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-24" /></div></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    : mostWishlistedRecords.length > 0
                      ? mostWishlistedRecords.map((record) => (
                          <TableRow
                            key={`wl-${record.app_id}-${record.rank}`}
                            className={cn(getRowClassName(record.rank))}
                          >
                            <TableCell><RankBadge rank={record.rank} /></TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="h-10 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                <img
                                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${record.app_id}/header.jpg`}
                                  alt={record.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Link to={`/games/app/${record.app_id}`} className="font-medium text-foreground transition hover:text-primary">{record.name}</Link>
                                  <a href={`https://store.steampowered.com/app/${record.app_id}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-foreground" aria-label={`打开 ${record.name} Steam 商店`}><ExternalLink className="h-4 w-4" /></a>
                                </div>
                                <div className="text-xs text-muted-foreground">App ID: {record.app_id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Heart className="h-4 w-4 text-rose-500" />
                                <span>{formatNumber(record.follow_count)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-emerald-600">+{formatNumber(record.seven_day_gain)}</TableCell>
                          </TableRow>
                        ))
                      : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">暂无数据</TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Pagination
            page={mostWishlistedPage}
            pageSize={mostWishlistedPageSize}
            total={mostWishlistedTotal}
            onPageChange={setMostWishlistedPage}
            onPageSizeChange={(v) => { setMostWishlistedPageSize(v); setMostWishlistedPage(1) }}
          />
        </TabsContent>

        <TabsContent value="players">
          <TopPlayersTable
            records={topPlayersRecords}
            loading={topPlayersQuery.isLoading}
            count={limitValue}
          />
        </TabsContent>

        {/* SteamDB 排行：最多关注 */}
        <TabsContent value="mostfollowed" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">排名</TableHead>
                    <TableHead className="hidden w-[100px] sm:table-cell">封面</TableHead>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[180px]">关注数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostFollowedQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`mf-sk-${index}`}>
                          <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-16" /></TableCell>
                          <TableCell><div className="space-y-2"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-24" /></div></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    : mostFollowedRecords.length > 0
                      ? mostFollowedRecords.map((record) => (
                          <TableRow
                            key={`mf-${record.app_id}-${record.rank}`}
                            className={cn(getRowClassName(record.rank))}
                          >
                            <TableCell><RankBadge rank={record.rank} /></TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="h-10 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                <img
                                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${record.app_id}/header.jpg`}
                                  alt={record.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Link to={`/games/app/${record.app_id}`} className="font-medium text-foreground transition hover:text-primary">{record.name}</Link>
                                  <a href={`https://store.steampowered.com/app/${record.app_id}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-foreground" aria-label={`打开 ${record.name} Steam 商店`}><ExternalLink className="h-4 w-4" /></a>
                                </div>
                                <div className="text-xs text-muted-foreground">App ID: {record.app_id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Heart className="h-4 w-4 text-rose-500" />
                                <span>{formatNumber(record.follower_count)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      : (
                          <TableRow>
                            <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">暂无数据</TableCell>
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
            onPageSizeChange={(v) => { setMostFollowedPageSize(v); setMostFollowedPage(1) }}
          />
        </TabsContent>

        {/* SteamDB 排行：最高评分 */}
        <TabsContent value="toprated" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">排名</TableHead>
                    <TableHead className="hidden w-[100px] sm:table-cell">封面</TableHead>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[160px]">评分</TableHead>
                    <TableHead className="w-[160px]">评分票数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topRatedQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`tr-sk-${index}`}>
                          <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-16" /></TableCell>
                          <TableCell><div className="space-y-2"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-24" /></div></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    : topRatedRecords.length > 0
                      ? topRatedRecords.map((record) => (
                          <TableRow
                            key={`tr-${record.app_id}-${record.rank}`}
                            className={cn(getRowClassName(record.rank))}
                          >
                            <TableCell><RankBadge rank={record.rank} /></TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="h-10 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                <img
                                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${record.app_id}/header.jpg`}
                                  alt={record.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Link to={`/games/app/${record.app_id}`} className="font-medium text-foreground transition hover:text-primary">{record.name}</Link>
                                  <a href={`https://store.steampowered.com/app/${record.app_id}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-foreground" aria-label={`打开 ${record.name} Steam 商店`}><ExternalLink className="h-4 w-4" /></a>
                                </div>
                                <div className="text-xs text-muted-foreground">App ID: {record.app_id}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatRatingPercent(record.rating)}</TableCell>
                            <TableCell>{formatNumber(record.votes)}</TableCell>
                          </TableRow>
                        ))
                      : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">暂无数据</TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Pagination
            page={topRatedPage}
            pageSize={topRatedPageSize}
            total={topRatedTotal}
            onPageChange={setTopRatedPage}
            onPageSizeChange={(v) => { setTopRatedPageSize(v); setTopRatedPage(1) }}
          />
        </TabsContent>

        {/* SteamDB 排行：最多游玩 */}
        <TabsContent value="mostplayed" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">排名</TableHead>
                    <TableHead className="hidden w-[100px] sm:table-cell">封面</TableHead>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[180px]">当前在线</TableHead>
                    <TableHead className="w-[180px]">今日峰值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostPlayedQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`mp-sk-${index}`}>
                          <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-16" /></TableCell>
                          <TableCell><div className="space-y-2"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-24" /></div></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    : mostPlayedRecords.length > 0
                      ? mostPlayedRecords.map((record) => (
                          <TableRow
                            key={`mp-${record.app_id}-${record.rank}`}
                            className={cn(getRowClassName(record.rank))}
                          >
                            <TableCell><RankBadge rank={record.rank} /></TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="h-10 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                <img
                                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${record.app_id}/header.jpg`}
                                  alt={record.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Link to={`/games/app/${record.app_id}`} className="font-medium text-foreground transition hover:text-primary">{record.name}</Link>
                                  <a href={`https://store.steampowered.com/app/${record.app_id}`} target="_blank" rel="noreferrer" className="text-muted-foreground transition hover:text-foreground" aria-label={`打开 ${record.name} Steam 商店`}><ExternalLink className="h-4 w-4" /></a>
                                </div>
                                <div className="text-xs text-muted-foreground">App ID: {record.app_id}</div>
                              </div>
                            </TableCell>
                            <TableCell>{formatNumber(record.current_players)}</TableCell>
                            <TableCell>{formatNumber(record.peak_today)}</TableCell>
                          </TableRow>
                        ))
                      : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">暂无数据</TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Pagination
            page={mostPlayedPage}
            pageSize={mostPlayedPageSize}
            total={mostPlayedTotal}
            onPageChange={setMostPlayedPage}
            onPageSizeChange={(v) => { setMostPlayedPageSize(v); setMostPlayedPage(1) }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
