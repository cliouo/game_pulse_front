import GameCard from "@/components/common/GameCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePotentialGames } from "@/hooks/use-publisher"
import { cn } from "@/lib/utils"

const placeholderItems = Array.from({ length: 5 })
type HotGamesPreviewProps = {
  className?: string
}

export default function HotGamesPreview({ className }: HotGamesPreviewProps) {
  const query = usePotentialGames({
    sort_by: "potential_score",
    sort_order: "desc",
    page_size: 5,
    page: 1,
  })

  const games = query.data?.data ?? []

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">最新高潜力游戏</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {query.isError ? (
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
            <span>高潜力游戏加载失败，请稍后重试。</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              重试
            </Button>
          </div>
        ) : query.isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {placeholderItems.map((_, index) => (
              <GameCard
                key={`hot-loading-${index}`}
                loading
                className="w-[220px] shrink-0"
              />
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {games.map((game) => (
              <GameCard
                key={`hot-game-${game.id}`}
                name={game.name}
                price={game.price}
                discountPercent={game.discount_percent}
                reviewScore={game.review_score}
                followers={game.followers}
                currentPlayers={game.current_players}
                type={game.type}
                headerImage={game.header_image}
                storeUrl={game.store_url}
                comingSoon={game.coming_soon}
                className="w-[220px] shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
            暂无高潜力游戏
          </div>
        )}
      </CardContent>
    </Card>
  )
}
