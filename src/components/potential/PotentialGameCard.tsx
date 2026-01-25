import { ExternalLink, Heart, Tag, Users } from "lucide-react"

import PotentialScoreBadge from "@/components/potential/PotentialScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { PotentialGameScore } from "@/types"

type PotentialGameCardProps = {
  game?: PotentialGameScore
  loading?: boolean
  className?: string
}

const numberFormatter = new Intl.NumberFormat("zh-CN")
const compactFormatter = new Intl.NumberFormat("zh-CN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const formatCompactNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return compactFormatter.format(value)
}

const formatPercent = (value?: number) => {
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

const riskStyles: Record<string, string> = {
  LOW: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  MEDIUM: "border-amber-300/40 bg-amber-300/10 text-amber-300",
  HIGH: "border-rose-400/40 bg-rose-400/10 text-rose-400",
}

const investmentStyles: Record<string, string> = {
  INDIE: "border-sky-400/40 bg-sky-400/10 text-sky-400",
  MID_BUDGET: "border-violet-400/40 bg-violet-400/10 text-violet-400",
  AAA: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-400",
}

export default function PotentialGameCard({
  game,
  loading = false,
  className,
}: PotentialGameCardProps) {
  if (loading) {
    return (
      <Card className={cn("border-border/60 bg-card/60 shadow-sm", className)}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <Skeleton className="h-32 w-full rounded-lg md:w-48" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!game) {
    return null
  }

  const statusLabel = game.coming_soon ? "即将发售" : "已发售"
  const statusClass = game.coming_soon
    ? "bg-amber-500/15 text-amber-400"
    : "bg-emerald-500/15 text-emerald-400"

  const riskClass =
    riskStyles[game.risk_level] ?? "border-border/60 text-muted-foreground"
  const investmentClass =
    investmentStyles[game.investment_category] ??
    "border-border/60 text-muted-foreground"

  const renderPrice = () => {
    if (typeof game.price !== "number") {
      return <span className="text-muted-foreground">--</span>
    }
    if (game.price === 0) {
      return <span className="text-emerald-400">免费</span>
    }
    if (game.discount_percent > 0) {
      const discounted = getDiscountedPrice(game.price, game.discount_percent)
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(game.price)}
          </span>
          <span className="text-sm font-semibold text-emerald-500">
            {formatPrice(discounted)}
          </span>
          <Badge
            variant="secondary"
            className="bg-rose-500/15 text-[10px] text-rose-400"
          >
            -{Math.round(game.discount_percent)}%
          </Badge>
        </div>
      )
    }
    return <span className="text-sm font-semibold">{formatPrice(game.price)}</span>
  }

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40 md:w-48">
            {game.header_image ? (
              <img
                src={game.header_image}
                alt={game.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                暂无封面
              </div>
            )}
            <Badge
              variant="secondary"
              className={cn(
                "absolute left-2 top-2 border border-transparent text-[10px]",
                statusClass
              )}
            >
              {statusLabel}
            </Badge>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {game.name}
                  </h3>
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
                  开发商 {game.developers || "--"}
                  {game.publishers ? ` · 发行商 ${game.publishers}` : ""}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>类型 {game.type || "--"}</span>
                  <span>发售 {game.release_date || "--"}</span>
                  <span>评分 {formatPercent(game.review_score)}</span>
                </div>
              </div>
              <PotentialScoreBadge score={game.potential_score} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className={cn("border text-[10px]", riskClass)}
              >
                {game.risk_level}
              </Badge>
              <Badge
                variant="outline"
                className={cn("border text-[10px]", investmentClass)}
              >
                {game.investment_category}
              </Badge>
              <Badge variant="outline" className="border-border/60 text-[10px]">
                关注 {formatCompactNumber(game.followers)}
              </Badge>
              <Badge variant="outline" className="border-border/60 text-[10px]">
                在线 {formatCompactNumber(game.current_players)}
              </Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs">
                <span className="text-muted-foreground">关注度潜力</span>
                <span className="font-medium">
                  {formatPercent(game.follower_potential)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs">
                <span className="text-muted-foreground">市场潜力</span>
                <span className="font-medium">
                  {formatPercent(game.market_potential)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs">
                <span className="text-muted-foreground">愿望单潜力</span>
                <span className="font-medium">
                  {formatPercent(game.wishlist_potential)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs">
                <span className="text-muted-foreground">口碑潜力</span>
                <span className="font-medium">
                  {formatPercent(game.review_potential)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                {formatNumber(game.followers)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-sky-400" />
                {formatNumber(game.current_players)}
              </span>
              <span>愿望单排名 {formatNumber(game.wishlist_rank)}</span>
              <span>畅销排名 {formatNumber(game.selling_rank)}</span>
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-amber-400" />
                {renderPrice()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
