import { CalendarClock, Gamepad2, Rocket, TrendingUp } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

import RiskPieChart from "@/components/charts/RiskPieChart"
import { BlurText } from "@/components/ui/blur-text"
import StatCard from "@/components/common/StatCard"
import HotGamesPreview from "@/components/dashboard/HotGamesPreview"
import QuickLinks from "@/components/dashboard/QuickLinks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats } from "@/hooks/use-publisher"

const numberFormatter = new Intl.NumberFormat("zh-CN")

const formatNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "--"
  }
  return numberFormatter.format(value)
}

const formatUpdateTime = (value?: string) => {
  if (!value) {
    return "暂无更新"
  }
  const parsed = parseISO(value)
  if (isValid(parsed)) {
    return format(parsed, "yyyy年MM月dd日 HH:mm", { locale: zhCN })
  }
  const fallback = new Date(value)
  if (isValid(fallback)) {
    return format(fallback, "yyyy年MM月dd日 HH:mm", { locale: zhCN })
  }
  return "暂无更新"
}

export default function Dashboard() {
  const dashboardQuery = useDashboardStats()
  const stats = dashboardQuery.data?.data
  const statCards = [
    {
      title: "追踪游戏",
      value: formatNumber(stats?.total_games),
      icon: <Gamepad2 className="h-4 w-4" />,
      color: "primary" as const,
    },
    {
      title: "即将发售",
      value: formatNumber(stats?.coming_soon_games),
      icon: <CalendarClock className="h-4 w-4" />,
      color: "accent" as const,
    },
    {
      title: "高潜力游戏",
      value: formatNumber(stats?.high_potential_games),
      icon: <Rocket className="h-4 w-4" />,
      color: "success" as const,
    },
    {
      title: "中潜力游戏",
      value: formatNumber(stats?.medium_potential_games),
      icon: <TrendingUp className="h-4 w-4" />,
      color: "warning" as const,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            <BlurText
              text="仪表板概览"
              delay={0.15}
              animateBy="letters"
              direction="top"
            />
          </h1>
          {dashboardQuery.isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-sm text-muted-foreground">
              最后更新: {formatUpdateTime(stats?.last_update_time)}
            </p>
          )}
        </div>
      </div>

      {dashboardQuery.isError ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
          <span>仪表板数据加载失败，请稍后重试。</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dashboardQuery.refetch()}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            重试
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={dashboardQuery.isError ? "--" : stat.value}
            icon={stat.icon}
            color={stat.color}
            loading={dashboardQuery.isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">风险分布</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : dashboardQuery.isError ? (
              <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
                风险分布暂时不可用
              </div>
            ) : (
              <RiskPieChart
                low={stats?.low_risk_games ?? 0}
                medium={stats?.medium_risk_games ?? 0}
                high={stats?.high_risk_games ?? 0}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm transition hover:border-primary/40 hover:shadow-[0_0_18px_rgba(168,85,247,0.15)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">快速入口</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <QuickLinks />
          </CardContent>
        </Card>
      </div>

      <HotGamesPreview />
    </div>
  )
}
