import { useState } from "react"

import RiskBadge from "@/components/common/RiskBadge"
import OpportunityScore from "@/components/market/OpportunityScore"
import RelatedGames from "@/components/market/RelatedGames"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { MarketOpportunity } from "@/types"

type OpportunityCardProps = {
  opportunity?: MarketOpportunity
  loading?: boolean
  className?: string
}

const categoryPalettes = [
  "border-sky-400/40 bg-sky-400/10 text-sky-300",
  "border-violet-400/40 bg-violet-400/10 text-violet-300",
  "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "border-rose-400/40 bg-rose-400/10 text-rose-300",
  "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
]

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getCategoryStyle = (category?: string) => {
  if (!category) {
    return "border-border/60 bg-muted/30 text-muted-foreground"
  }
  const index = hashString(category) % categoryPalettes.length
  return categoryPalettes[index]
}

export default function OpportunityCard({
  opportunity,
  loading = false,
  className,
}: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const containerClass = cn(
    "group rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-emerald-400/20 p-[1px] shadow-sm transition hover:shadow-[0_0_26px_rgba(34,211,238,0.25)]",
    className
  )

  if (loading) {
    return (
      <div className={containerClass}>
        <Card className="rounded-2xl border border-transparent bg-card/80">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-3">
                <Skeleton className="h-24 w-32" />
                <Skeleton className="h-24 w-32" />
                <Skeleton className="h-24 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!opportunity) {
    return null
  }

  const description = opportunity.description || "暂无描述"
  const showToggle = description.length > 120
  const categoryLabel = opportunity.category || "未分类"
  const categoryStyle = getCategoryStyle(opportunity.category)

  return (
    <div className={containerClass}>
      <Card className="rounded-2xl border border-transparent bg-card/80">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={cn("border text-[10px]", categoryStyle)}
            >
              {categoryLabel}
            </Badge>
            <RiskBadge level={opportunity.risk_level} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {opportunity.title}
            </h3>
            <div className="h-px w-full bg-border/60" />
          </div>

          <div className="space-y-2">
            <p
              className={cn(
                "text-sm leading-relaxed text-muted-foreground",
                expanded ? "whitespace-pre-line" : "line-clamp-3"
              )}
            >
              {description}
            </p>
            {showToggle ? (
              <button
                type="button"
                className="text-xs font-medium text-accent transition hover:text-accent/80"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
              >
                {expanded ? "收起" : "展开"}
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <OpportunityScore score={opportunity.opportunity_score} />
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <span className="text-xs text-muted-foreground">时间窗口</span>
              <span className="text-sm font-semibold text-foreground">
                {opportunity.time_window || "--"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              相关游戏示例
            </span>
            <RelatedGames games={opportunity.examples} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
