import { type ReactNode, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useMostFollowed,
  useMostPlayed,
  useMostWishlisted,
  useTopRated,
} from "@/hooks/use-steam-metadata"
import type {
  SteamMostFollowedInfo,
  SteamMostPlayedInfo,
  SteamMostWishlistedInfo,
  SteamTopRatedInfo,
} from "@/types"

const compactNumberFormatter = new Intl.NumberFormat("zh-CN", { notation: "compact" })
const numberFormatter = new Intl.NumberFormat("zh-CN")

type ChartDatum = {
  name: string
}

type TooltipPayloadItem<T extends ChartDatum> = {
  name?: string
  value?: number | string
  payload?: T
}

type ChartTooltipProps<T extends ChartDatum> = {
  active?: boolean
  payload?: readonly TooltipPayloadItem<T>[]
}

type ChartPanelProps = {
  loading: boolean
  isEmpty: boolean
  children: ReactNode
}

const formatXAxisName = (value: number | string) => {
  const name = String(value ?? "")
  return name.length > 10 ? `${name.slice(0, 10)}…` : name
}

const formatYAxisValue = (value: number | string) => {
  const numericValue = typeof value === "number" ? value : Number(value)
  return Number.isNaN(numericValue)
    ? String(value)
    : compactNumberFormatter.format(numericValue)
}

const formatTooltipValue = (value?: number | string) => {
  if (typeof value === "number") {
    return numberFormatter.format(value)
  }

  const parsedValue = Number(value)
  if (!Number.isNaN(parsedValue)) {
    return numberFormatter.format(parsedValue)
  }

  return "--"
}

function ChartTooltipContent<T extends ChartDatum>({
  active,
  payload,
}: ChartTooltipProps<T>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const gameName = payload[0]?.payload?.name ?? "--"

  return (
    <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-foreground">{gameName}</div>
      <div className="mt-1 space-y-1">
        {payload.map((entry, index) => (
          <div
            key={`${entry.name ?? "value"}-${index}`}
            className="flex items-center justify-between gap-4 text-muted-foreground"
          >
            <span>{entry.name ?? "数值"}</span>
            <span className="font-medium text-foreground">
              {formatTooltipValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartPanel({ loading, isEmpty, children }: ChartPanelProps) {
  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />
  }

  if (isEmpty) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
        暂无数据
      </div>
    )
  }

  return (
    <Card className="border-border/60 bg-card/60 shadow-sm">
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  )
}

export default function Charts() {
  const [activeTab, setActiveTab] = useState("onlinePlayers")

  const mostPlayedQuery = useMostPlayed(1, 20)
  const mostFollowedQuery = useMostFollowed(1, 20)
  const topRatedQuery = useTopRated(1, 20)
  const mostWishlistedQuery = useMostWishlisted(1, 20)

  const mostPlayedData: SteamMostPlayedInfo[] = mostPlayedQuery.data?.data ?? []
  const mostFollowedData: SteamMostFollowedInfo[] = mostFollowedQuery.data?.data ?? []
  const topRatedData: SteamTopRatedInfo[] = topRatedQuery.data?.data ?? []
  const mostWishlistedData: SteamMostWishlistedInfo[] =
    mostWishlistedQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">数据图表</h1>
        <p className="text-sm text-muted-foreground">
          Steam 游戏数据可视化 — Top 20 排行
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="onlinePlayers">在线玩家</TabsTrigger>
          <TabsTrigger value="followers">关注数</TabsTrigger>
          <TabsTrigger value="rating">评分</TabsTrigger>
          <TabsTrigger value="wishlist">愿望单</TabsTrigger>
        </TabsList>

        <TabsContent value="onlinePlayers" className="space-y-4">
          <ChartPanel
            loading={mostPlayedQuery.isLoading}
            isEmpty={mostPlayedData.length === 0}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mostPlayedData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/30"
                />
                <XAxis
                  dataKey="name"
                  tickFormatter={formatXAxisName}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatYAxisValue} />
                <Tooltip
                  content={(props) => (
                    <ChartTooltipContent
                      {...(props as ChartTooltipProps<SteamMostPlayedInfo>)}
                    />
                  )}
                />
                <Legend />
                <Bar
                  dataKey="current_players"
                  name="当前在线"
                  fill="hsl(var(--primary))"
                />
                <Bar
                  dataKey="peak_today"
                  name="今日峰值"
                  fill="hsl(var(--accent))"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabsContent>

        <TabsContent value="followers" className="space-y-4">
          <ChartPanel
            loading={mostFollowedQuery.isLoading}
            isEmpty={mostFollowedData.length === 0}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mostFollowedData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/30"
                />
                <XAxis
                  dataKey="name"
                  tickFormatter={formatXAxisName}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatYAxisValue} />
                <Tooltip
                  content={(props) => (
                    <ChartTooltipContent
                      {...(props as ChartTooltipProps<SteamMostFollowedInfo>)}
                    />
                  )}
                />
                <Bar
                  dataKey="follower_count"
                  name="关注数"
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabsContent>

        <TabsContent value="rating" className="space-y-4">
          <ChartPanel loading={topRatedQuery.isLoading} isEmpty={topRatedData.length === 0}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topRatedData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/30"
                />
                <XAxis
                  dataKey="name"
                  tickFormatter={formatXAxisName}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatYAxisValue} />
                <Tooltip
                  content={(props) => (
                    <ChartTooltipContent
                      {...(props as ChartTooltipProps<SteamTopRatedInfo>)}
                    />
                  )}
                />
                <Bar dataKey="rating" name="评分" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <ChartPanel
            loading={mostWishlistedQuery.isLoading}
            isEmpty={mostWishlistedData.length === 0}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mostWishlistedData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/30"
                />
                <XAxis
                  dataKey="name"
                  tickFormatter={formatXAxisName}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatYAxisValue} />
                <Tooltip
                  content={(props) => (
                    <ChartTooltipContent
                      {...(props as ChartTooltipProps<SteamMostWishlistedInfo>)}
                    />
                  )}
                />
                <Bar
                  dataKey="wishlist_count"
                  name="愿望单"
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
