import { cn } from "@/lib/utils"

type RankBadgeProps = {
  rank: number
  className?: string
}

const rankStyles: Record<number, { icon: string; className: string }> = {
  1: {
    icon: "🥇",
    className: "bg-gradient-to-r from-amber-300/80 to-amber-100 text-amber-950",
  },
  2: {
    icon: "🥈",
    className: "bg-gradient-to-r from-slate-300/80 to-slate-100 text-slate-900",
  },
  3: {
    icon: "🥉",
    className: "bg-gradient-to-r from-amber-600/80 to-amber-300 text-amber-950",
  },
}

export default function RankBadge({ rank, className }: RankBadgeProps) {
  const style = rankStyles[rank]

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        style?.className ?? "bg-muted/50 text-foreground",
        className
      )}
    >
      {style ? <span className="text-sm leading-none">{style.icon}</span> : null}
      <span>{rank}</span>
    </span>
  )
}
