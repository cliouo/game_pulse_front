import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type OpportunityScoreProps = {
  score?: number
  size?: number
  strokeWidth?: number
  className?: string
}

type ScorePalette = {
  stroke: string
  text: string
  glow: string
}

const getScorePalette = (score: number): ScorePalette => {
  if (score >= 80) {
    return {
      stroke: "stroke-emerald-400",
      text: "text-emerald-400",
      glow: "drop-shadow-[0_0_6px_rgba(74,222,128,0.35)]",
    }
  }
  if (score >= 60) {
    return {
      stroke: "stroke-amber-300",
      text: "text-amber-300",
      glow: "drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]",
    }
  }
  return {
    stroke: "stroke-orange-400",
    text: "text-orange-400",
    glow: "drop-shadow-[0_0_6px_rgba(251,146,60,0.35)]",
  }
}

const clampScore = (score?: number) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return undefined
  }
  return Math.max(0, Math.min(100, score))
}

export default function OpportunityScore({
  score,
  size = 64,
  strokeWidth = 6,
  className,
}: OpportunityScoreProps) {
  const normalized = clampScore(score)
  const rounded = typeof normalized === "number" ? Math.round(normalized) : undefined
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof rounded === "number") {
      const frame = requestAnimationFrame(() => setProgress(rounded))
      return () => cancelAnimationFrame(frame)
    }
    setProgress(0)
  }, [rounded])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress / 100)
  const palette =
    typeof normalized === "number"
      ? getScorePalette(normalized)
      : {
          stroke: "stroke-slate-400/40",
          text: "text-muted-foreground",
          glow: "",
        }
  const scoreLabel = typeof rounded === "number" ? `${rounded}/100` : "--"

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3",
        className
      )}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted/40"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn(
              "transition-[stroke-dashoffset] duration-700 ease-out",
              palette.stroke,
              palette.glow
            )}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-semibold text-foreground">
          {rounded ?? "--"}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">机会评分</p>
        <p className={cn("text-sm font-semibold", palette.text)}>{scoreLabel}</p>
      </div>
    </div>
  )
}
