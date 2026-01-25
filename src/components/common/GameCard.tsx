import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type GameCardProps = {
  title?: string
  price?: string
  rating?: string
  followers?: string
  genre?: string
  coverUrl?: string
  loading?: boolean
  layout?: "grid" | "list"
  className?: string
}

export default function GameCard({
  title = "未知游戏",
  price = "¥0",
  rating = "0.0",
  followers = "0",
  genre,
  coverUrl,
  loading = false,
  layout = "grid",
  className,
}: GameCardProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-border/60 bg-card/60 shadow-sm transition hover:border-primary/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]",
          layout === "list" ? "flex items-center gap-4 p-4" : "",
          className
        )}
      >
        <Skeleton
          className={cn(
            "rounded-lg",
            layout === "list" ? "h-20 w-20" : "h-40 w-full"
          )}
        />
        <div
          className={cn(
            "space-y-2",
            layout === "list" ? "flex-1" : "p-4"
          )}
        >
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </Card>
    )
  }

  if (layout === "list") {
    return (
      <Card
        className={cn(
          "group flex items-center gap-4 border-border/60 bg-card/60 p-4 shadow-sm transition hover:border-primary/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]",
          className
        )}
      >
        <div className="h-20 w-20 overflow-hidden rounded-lg border border-border/60 bg-muted/40">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              暂无封面
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <Badge variant="secondary" className="bg-secondary/80 text-xs">
              {price}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>评分 {rating}</span>
            <span>{followers} 关注</span>
          </div>
          {genre ? (
            <Badge variant="outline" className="border-primary/40 text-[10px]">
              {genre}
            </Badge>
          ) : null}
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/60 bg-card/60 shadow-sm transition hover:border-primary/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]",
        className
      )}
    >
      <div className="aspect-[4/5] w-full overflow-hidden border-b border-border/60 bg-muted/40">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            暂无封面
          </div>
        )}
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary" className="bg-secondary/80 text-xs">
            {price}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>评分 {rating}</span>
          <span>{followers} 关注</span>
        </div>
        {genre ? (
          <Badge variant="outline" className="border-primary/40 text-[10px]">
            {genre}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  )
}
