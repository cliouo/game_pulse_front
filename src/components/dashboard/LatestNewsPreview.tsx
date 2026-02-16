import { Newspaper } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLatestNews } from "@/hooks/use-steam-news"
import { cn } from "@/lib/utils"

type LatestNewsPreviewProps = { className?: string }

export default function LatestNewsPreview({ className }: LatestNewsPreviewProps) {
  const query = useLatestNews(1, 5)
  const items = query.data?.data ?? []

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">热门新闻</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`news-skeleton-${i}`} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            新闻数据暂不可用
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`news-preview-${item.id}`}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <Newspaper className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm text-foreground transition hover:text-primary"
                  >
                    {item.title}
                  </a>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.published_at
                    ? formatDistanceToNow(new Date(item.published_at * 1000), {
                        addSuffix: true,
                        locale: zhCN,
                      })
                    : "--"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            暂无新闻数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
