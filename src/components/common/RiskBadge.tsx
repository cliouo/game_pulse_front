import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type RiskBadgeProps = {
  level?: string
  className?: string
}

const riskConfig: Record<
  string,
  { label: string; className: string }
> = {
  LOW: {
    label: "低风险",
    className: "border-emerald-400/40 bg-emerald-400/15 text-emerald-400",
  },
  MEDIUM: {
    label: "中风险",
    className: "border-amber-400/40 bg-amber-400/15 text-amber-300",
  },
  HIGH: {
    label: "高风险",
    className: "border-rose-500/40 bg-rose-500/15 text-rose-400",
  },
}

export default function RiskBadge({ level, className }: RiskBadgeProps) {
  const normalized = level?.toUpperCase() ?? ""
  const config = riskConfig[normalized] ?? {
    label: level ? "未知风险" : "暂无风险",
    className: "border-border/60 bg-muted/30 text-muted-foreground",
  }

  return (
    <Badge
      variant="secondary"
      className={cn("border text-[10px] font-semibold", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
