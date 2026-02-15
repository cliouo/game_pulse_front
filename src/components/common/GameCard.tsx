import { ExternalLink, Heart, Users } from "lucide-react"
import { Link } from "react-router-dom"

import Magnet from "@/components/react-bits/Magnet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type GameCardProps = {
  name?: string
  title?: string
  developers?: string
  publishers?: string
  type?: string
  genre?: string
  headerImage?: string
  coverUrl?: string
  price?: number | string
  discountPercent?: number
  reviewScore?: number
  followers?: number
  currentPlayers?: number
  comingSoon?: boolean
  storeUrl?: string
  detailUrl?: string
  loading?: boolean
  layout?: "grid" | "list"
  className?: string
}

const compactFormatter = new Intl.NumberFormat("zh-CN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const formatCompactNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return compactFormatter.format(value)
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

const getScoreTone = (score: number) => {
  if (score >= 70) {
    return "bg-emerald-500"
  }
  if (score >= 40) {
    return "bg-amber-400"
  }
  return "bg-slate-400"
}

export default function GameCard({
  name,
  title,
  developers,
  publishers,
  type,
  genre,
  headerImage,
  coverUrl,
  price,
  discountPercent,
  reviewScore,
  followers,
  currentPlayers,
  comingSoon,
  storeUrl,
  detailUrl,
  loading = false,
  layout = "grid",
  className,
}: GameCardProps) {
  const displayName = name ?? title ?? "未知游戏"
  const displayType = type ?? genre
  const imageUrl = headerImage ?? coverUrl
  const scoreValue =
    typeof reviewScore === "number"
      ? Math.max(0, Math.min(100, reviewScore))
      : undefined
  const scoreLabel =
    typeof scoreValue === "number" ? `${Math.round(scoreValue)}%` : "--"
  const statusLabel =
    typeof comingSoon === "boolean" ? (comingSoon ? "即将发售" : "已发售") : "未知"
  const statusClass =
    comingSoon === true
      ? "bg-amber-500/15 text-amber-400"
      : comingSoon === false
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-muted text-muted-foreground"

  const renderPrice = () => {
    if (typeof price === "string") {
      return <span className="text-sm font-semibold">{price}</span>
    }
    if (typeof price !== "number") {
      return <span className="text-sm text-muted-foreground">--</span>
    }
    if (price === 0) {
      return <span className="text-sm font-semibold text-emerald-500">免费</span>
    }
    if (typeof discountPercent === "number" && discountPercent > 0) {
      const discounted = getDiscountedPrice(price, discountPercent)
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(price)}
          </span>
          <span className="text-sm font-semibold text-emerald-500">
            {formatPrice(discounted)}
          </span>
          <Badge
            variant="secondary"
            className="bg-rose-500/15 text-[10px] text-rose-400"
          >
            -{Math.round(discountPercent)}%
          </Badge>
        </div>
      )
    }
    return <span className="text-sm font-semibold">{formatPrice(price)}</span>
  }

  const hasActions = Boolean(storeUrl || detailUrl)

  if (loading) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-border/60 bg-card/60 shadow-sm",
          layout === "list" ? "flex flex-col gap-4 p-4 sm:flex-row" : "",
          className
        )}
      >
        <Skeleton
          className={cn(
            "rounded-lg",
            layout === "list" ? "h-24 w-full sm:h-24 sm:w-32" : "aspect-video w-full"
          )}
        />
        <div
          className={cn(
            "space-y-3",
            layout === "list" ? "flex-1" : "p-4"
          )}
        >
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      </Card>
    )
  }

  if (layout === "list") {
    return (
      <Magnet
        padding={50}
        magnetStrength={5}
        wrapperClassName={cn("group w-full", className)}
        innerClassName="w-full"
      >
        <Card
          className={cn(
            "flex flex-col gap-4 border-border/60 bg-card/60 p-4 shadow-sm transition group-hover:border-primary/50 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.25)] sm:flex-row"
          )}
        >
          <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40 sm:w-32">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
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
            {hasActions ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                {storeUrl ? (
                  <Button asChild size="sm" variant="secondary">
                    <a href={storeUrl} target="_blank" rel="noreferrer">
                      商店
                    </a>
                  </Button>
                ) : null}
                {detailUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <Link to={detailUrl}>详情</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {displayName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {developers ? `开发商 ${developers}` : "开发商 --"}
                  {publishers ? ` · 发行商 ${publishers}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">{renderPrice()}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {displayType ? (
                <Badge
                  variant="outline"
                  className="border-primary/40 text-[10px]"
                >
                  {displayType}
                </Badge>
              ) : null}
              <span>评分 {scoreLabel}</span>
              <span>关注 {formatCompactNumber(followers)}</span>
              <span>在线 {formatCompactNumber(currentPlayers)}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>评分进度</span>
                <span>{scoreLabel}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50">
                <div
                  className={cn("h-full rounded-full", getScoreTone(scoreValue ?? 0))}
                  style={{ width: `${scoreValue ?? 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                {formatCompactNumber(followers)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-sky-400" />
                {formatCompactNumber(currentPlayers)}
              </span>
            </div>
          </div>
        </Card>
      </Magnet>
    )
  }

  return (
    <Magnet
      padding={50}
      magnetStrength={5}
      wrapperClassName={cn("group w-full h-full", className)}
      innerClassName="w-full h-full"
    >
      <Card
        className={cn(
          "h-full overflow-hidden border-border/60 bg-card/60 shadow-sm transition group-hover:border-primary/50 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]"
        )}
      >
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden border-b border-border/60 bg-muted/40">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                暂无封面
              </div>
            )}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "absolute left-3 top-3 border border-transparent text-[10px]",
              statusClass
            )}
          >
            {statusLabel}
          </Badge>
          {hasActions ? (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
              {storeUrl ? (
                <Button asChild size="sm" variant="secondary">
                  <a href={storeUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    商店
                  </a>
                </Button>
              ) : null}
              {detailUrl ? (
                <Button asChild size="sm" variant="outline">
                  <Link to={detailUrl}>详情</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        <CardContent className="space-y-2 p-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
            <p className="text-xs text-muted-foreground">
              {developers ? `开发商 ${developers}` : "开发商 --"}
              {publishers ? ` · 发行商 ${publishers}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {displayType ? (
              <Badge variant="outline" className="border-primary/40 text-[10px]">
                {displayType}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">类型 --</span>
            )}
            {renderPrice()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>评分</span>
              <span>{scoreLabel}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/50">
              <div
                className={cn("h-full rounded-full", getScoreTone(scoreValue ?? 0))}
                style={{ width: `${scoreValue ?? 0}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              {formatCompactNumber(followers)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-sky-400" />
              {formatCompactNumber(currentPlayers)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Magnet>
  )
}
