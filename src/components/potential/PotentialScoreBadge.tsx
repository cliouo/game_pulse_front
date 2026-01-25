import { cn } from "@/lib/utils"

type PotentialScoreBadgeProps = {
  score?: number
  className?: string
}

const getScoreStyles = (score: number) => {
  if (score >= 70) {
    return {
      text: "text-emerald-400",
      border: "border-emerald-400/50",
      glow: "shadow-[0_0_20px_rgba(74,222,128,0.4)]",
      bg: "bg-emerald-400/10",
    }
  }
  if (score >= 40) {
    return {
      text: "text-amber-300",
      border: "border-amber-300/50",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.4)]",
      bg: "bg-amber-300/10",
    }
  }
  return {
    text: "text-slate-400",
    border: "border-slate-400/40",
    glow: "shadow-[0_0_16px_rgba(148,163,184,0.35)]",
    bg: "bg-slate-400/10",
  }
}

export default function PotentialScoreBadge({
  score,
  className,
}: PotentialScoreBadgeProps) {
  const value =
    typeof score === "number"
      ? Math.max(0, Math.min(100, Math.round(score)))
      : undefined
  const palette = getScoreStyles(value ?? 0)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border px-4 py-3 text-center",
        palette.border,
        palette.bg,
        palette.glow,
        className
      )}
    >
      <span className={cn("text-3xl font-semibold leading-none", palette.text)}>
        {value ?? "--"}
      </span>
      <span className="mt-1 text-[10px] text-muted-foreground">潜力评分</span>
    </div>
  )
}
