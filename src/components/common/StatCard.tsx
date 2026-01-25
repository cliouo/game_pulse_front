import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: React.ReactNode
  icon?: React.ReactNode
  color?: "primary" | "accent" | "success" | "warning"
  trend?: {
    value: string
    positive?: boolean
  }
  loading?: boolean
  className?: string
}

const colorStyles = {
  primary: {
    value: "from-primary via-primary to-fuchsia-300",
    icon: "border-primary/40 bg-primary/10 text-primary shadow-[0_0_18px_rgba(168,85,247,0.35)]",
    glow: "hover:border-primary/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.25)]",
  },
  accent: {
    value: "from-accent via-accent to-sky-200",
    icon: "border-accent/40 bg-accent/10 text-accent shadow-[0_0_18px_rgba(34,211,238,0.35)]",
    glow: "hover:border-accent/60 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]",
  },
  success: {
    value: "from-emerald-400 via-emerald-400 to-lime-300",
    icon: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.3)]",
    glow: "hover:border-emerald-400/60 hover:shadow-[0_0_24px_rgba(74,222,128,0.25)]",
  },
  warning: {
    value: "from-amber-300 via-amber-300 to-yellow-200",
    icon: "border-amber-300/40 bg-amber-300/10 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.3)]",
    glow: "hover:border-amber-300/60 hover:shadow-[0_0_24px_rgba(251,191,36,0.25)]",
  },
}

import CountUp from "@/components/ui/count-up"

// ... imports

export default function StatCard({
  title,
  value,
  icon,
  color = "primary",
  trend,
  loading = false,
  className,
}: StatCardProps) {
  const palette = colorStyles[color]
  if (loading) {
    return (
      <Card className={cn("border-border/60 bg-card/60 shadow-sm", className)}>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 shadow-sm transition",
        palette.glow,
        className
      )}
    >
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-3xl font-semibold tracking-tight text-transparent",
                "bg-gradient-to-r bg-clip-text",
                palette.value
              )}
            >
              {typeof value === "number" ? (
                <CountUp
                  to={value}
                  duration={2}
                  separator=","
                  className="bg-inherit text-inherit"
                />
              ) : (
                value
              )}
            </p>
          </div>
          {icon ? (
            <div className={cn("rounded-lg border p-2", palette.icon)}>
              {icon}
            </div>
          ) : null}
        </div>
        {trend ? (
          <div
            className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {trend.value}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
