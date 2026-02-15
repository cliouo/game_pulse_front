import { Heart } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMostFollowed } from "@/hooks/use-steam-metadata"
import { cn } from "@/lib/utils"

type MostFollowedPreviewProps = { className?: string }

const compactFormatter = new Intl.NumberFormat("zh-CN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export default function MostFollowedPreview({ className }: MostFollowedPreviewProps) {
  const query = useMostFollowed(1, 5)
  const items = query.data?.data ?? []

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">最受关注</CardTitle>
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
                key={`mf-skeleton-${i}`}
                className="flex items-center justify-between"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            关注数据暂不可用
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`mf-preview-${item.app_id}`}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground">
                    {item.rank}
                  </span>
                  <Link
                    to={`/games/app/${item.app_id}`}
                    className="truncate text-sm text-foreground transition hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3 text-rose-400" />
                  <span>{compactFormatter.format(item.follower_count)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            暂无关注数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
