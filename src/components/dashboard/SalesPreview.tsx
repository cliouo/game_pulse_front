import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentSales } from "@/hooks/use-steam-metadata"
import { cn } from "@/lib/utils"

type SalesPreviewProps = { className?: string }

const priceFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function SalesPreview({ className }: SalesPreviewProps) {
  const query = useCurrentSales(1, 5)
  const sales = query.data?.data ?? []

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">热门促销</CardTitle>
        <Link
          to="/steamdb"
          className="text-xs text-muted-foreground transition hover:text-primary"
        >
          查看全部
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`sale-skeleton-${i}`}
                className="flex items-center justify-between"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-14" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            促销数据暂不可用
          </div>
        ) : sales.length > 0 ? (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div
                key={`sale-preview-${sale.app_id}`}
                className="flex items-center justify-between gap-2"
              >
                <Link
                  to={`/games/app/${sale.app_id}`}
                  className="truncate text-sm text-foreground transition hover:text-primary"
                >
                  {sale.name}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through">
                    ¥{priceFormatter.format(sale.original_price)}
                  </span>
                  <Badge variant="destructive" className="text-[10px]">
                    -{Math.round(sale.discount_percent)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            暂无促销数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
