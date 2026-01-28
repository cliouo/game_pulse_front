import { ArrowUpRight, Gamepad2, Target, TrendingUp, Trophy } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type QuickLink = {
  title: string
  description: string
  to: string
  tone: "primary" | "accent" | "success" | "warning"
  icon: typeof Trophy
}

const toneStyles = {
  primary: {
    icon: "border-primary/40 bg-primary/10 text-primary shadow-[0_0_16px_rgba(168,85,247,0.3)]",
    glow: "hover:border-primary/60 hover:shadow-[0_0_22px_rgba(168,85,247,0.2)]",
  },
  accent: {
    icon: "border-accent/40 bg-accent/10 text-accent shadow-[0_0_16px_rgba(34,211,238,0.3)]",
    glow: "hover:border-accent/60 hover:shadow-[0_0_22px_rgba(34,211,238,0.2)]",
  },
  success: {
    icon: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.3)]",
    glow: "hover:border-emerald-400/60 hover:shadow-[0_0_22px_rgba(74,222,128,0.2)]",
  },
  warning: {
    icon: "border-amber-300/40 bg-amber-300/10 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.3)]",
    glow: "hover:border-amber-300/60 hover:shadow-[0_0_22px_rgba(251,191,36,0.2)]",
  },
}

const quickLinks: QuickLink[] = [
  {
    title: "排行榜",
    description: "查看热门榜单",
    to: "/rankings",
    icon: Trophy,
    tone: "primary",
  },
  {
    title: "游戏列表",
    description: "浏览游戏库",
    to: "/games",
    icon: Gamepad2,
    tone: "accent",
  },
  {
    title: "潜力分析",
    description: "追踪高潜力",
    to: "/potential",
    icon: TrendingUp,
    tone: "success",
  },
  {
    title: "市场机会",
    description: "发现新赛道",
    to: "/market",
    icon: Target,
    tone: "warning",
  },
]

type QuickLinksProps = {
  className?: string
}

export default function QuickLinks({ className }: QuickLinksProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1", className)}>
      {quickLinks.map((link) => {
        const style = toneStyles[link.tone]
        const Icon = link.icon
        return (
          <Link
            key={link.title}
            to={link.to}
            className="group block w-full"
          >
            <Card
              className={cn(
                "border-border/60 bg-card/60 shadow-sm transition",
                style.glow
              )}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("rounded-lg border p-2", style.icon)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
