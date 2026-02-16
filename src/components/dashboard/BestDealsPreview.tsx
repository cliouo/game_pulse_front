import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBestDeals } from "@/hooks/use-deals"
import { cn } from "@/lib/utils"

type BestDealsPreviewProps = { className?: string }

export default function BestDealsPreview({ className }: BestDealsPreviewProps) {
  const query = useBestDeals(1, 5)
  const deals = query.data?.data ?? []

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">最佳折扣</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`deal-skeleton-${i}`} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-14" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            折扣数据暂不可用
          </div>
        ) : deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={`deal-preview-${deal.id}`}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate text-sm text-foreground">
                  {deal.store}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-medium text-emerald-400">
                    ${deal.current_price.toFixed(2)}
                  </span>
                  {deal.discount_percent > 0 ? (
                    <Badge variant="destructive" className="text-[10px]">
                      -{Math.round(deal.discount_percent)}%
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            暂无折扣数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
