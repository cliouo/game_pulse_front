import { ExternalLink, Heart, Users } from "lucide-react"
import { Link } from "react-router-dom"

import RankBadge from "@/components/rankings/RankBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { TopGameInfo } from "@/types"

type TopPlayersTableProps = {
  records?: TopGameInfo[]
  loading?: boolean
  count?: number
  className?: string
}

const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const formatReviewScore = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return `${Math.round(value)}%`
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

const renderPrice = (price?: number, discountPercent?: number) => {
  if (typeof price !== "number") {
    return <span className="text-muted-foreground">--</span>
  }
  if (price === 0) {
    return <span className="text-emerald-600">免费</span>
  }
  if (typeof discountPercent === "number" && discountPercent > 0) {
    const discounted = getDiscountedPrice(price, discountPercent)
    return (
      <div className="flex flex-col">
        <span className="text-xs text-destructive line-through">
          {formatPrice(price)}
        </span>
        <span className="text-xs font-semibold text-emerald-600">
          {formatPrice(discounted)}
        </span>
      </div>
    )
  }
  return <span>{formatPrice(price)}</span>
}

export default function TopPlayersTable({
  records = [],
  loading = false,
  count = 10,
  className,
}: TopPlayersTableProps) {
  return (
    <Card className={cn("border-border/60 bg-card/60 shadow-sm", className)}>
      <CardContent className="pt-4">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">排名</TableHead>
              <TableHead className="hidden w-[100px] sm:table-cell">
                封面
              </TableHead>
              <TableHead>游戏</TableHead>
              <TableHead className="w-[140px]">在线人数</TableHead>
              <TableHead className="hidden w-[120px] md:table-cell">
                关注数
              </TableHead>
              <TableHead className="hidden w-[100px] lg:table-cell">
                评分
              </TableHead>
              <TableHead className="hidden w-[120px] lg:table-cell">
                价格
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: count }).map((_, index) => (
                  <TableRow key={`loading-row-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-10 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : records.length > 0
                ? records.map((record, index) => {
                    const rank = index + 1
                    const steamUrl = record.app_id
                      ? `https://store.steampowered.com/app/${record.app_id}`
                      : undefined
                    return (
                      <TableRow
                        key={`top-player-${record.id}`}
                        className={cn(getRowClassName(rank))}
                      >
                        <TableCell className="w-[60px]">
                          <RankBadge rank={rank} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="h-10 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                            {record.header_image ? (
                              <img
                                src={record.header_image}
                                alt={record.game_name}
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
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/games/app/${record.app_id}`}
                              className="font-medium text-foreground transition hover:text-primary"
                            >
                              {record.game_name}
                            </Link>
                            {steamUrl ? (
                              <a
                                href={steamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground transition hover:text-foreground"
                                aria-label={`打开 ${record.game_name} Steam 商店`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-sky-500" />
                            <span>{formatNumber(record.current_players)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-rose-500" />
                            <span>{formatNumber(record.followers)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatReviewScore(record.review_score)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {renderPrice(
                            record.price,
                            record.discount_percent
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
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
