import { cn } from "@/lib/utils"
import type { PotentialGameScore } from "@/types"

type RelatedGamesProps = {
  games?: PotentialGameScore[]
  limit?: number
  className?: string
}

const formatScore = (score?: number) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "--"
  }
  return Math.round(score).toString()
}

const getScoreTone = (score?: number) => {
  if (typeof score !== "number") {
    return "text-muted-foreground"
  }
  if (score >= 80) {
    return "text-emerald-300"
  }
  if (score >= 60) {
    return "text-amber-300"
  }
  return "text-orange-300"
}

export default function RelatedGames({
  games,
  limit = 5,
  className,
}: RelatedGamesProps) {
  const items = games?.slice(0, limit) ?? []

  if (items.length === 0) {
    return <div className="text-xs text-muted-foreground">暂无相关游戏</div>
  }

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
      {items.map((game) => {
        const scoreLabel = formatScore(game.potential_score)
        const scoreTone = getScoreTone(game.potential_score)
        const card = (
          <div className="group flex w-[150px] shrink-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-muted/20 transition hover:border-primary/50 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            <div className="relative h-20 w-full overflow-hidden bg-muted/40">
              {game.header_image ? (
                <img
                  src={game.header_image}
                  alt={game.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  暂无封面
                </div>
              )}
              <span
                className={cn(
                  "absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold",
                  scoreTone
                )}
              >
                {scoreLabel}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-2">
              <p className="line-clamp-2 text-xs font-medium text-foreground">
                {game.name}
              </p>
              <span className={cn("text-[10px]", scoreTone)}>
                潜力评分 {scoreLabel}
              </span>
            </div>
          </div>
        )

        if (game.store_url) {
          return (
            <a
              key={game.id}
              href={game.store_url}
              target="_blank"
              rel="noreferrer"
              className="block"
              aria-label={`打开 ${game.name} Steam 商店`}
            >
              {card}
            </a>
          )
        }

        return (
          <div key={game.id} className="block">
            {card}
          </div>
        )
      })}
    </div>
  )
}
