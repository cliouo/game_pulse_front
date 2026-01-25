import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { PieLabelRenderProps } from "recharts"

import { cn } from "@/lib/utils"

type RiskPieChartProps = {
  low: number
  medium: number
  high: number
  height?: number
  className?: string
}

type RiskDatum = {
  name: string
  value: number
  color: string
}

const RADIAN = Math.PI / 180
const RISK_COLORS = {
  low: "#22c55e",
  medium: "#facc15",
  high: "#f43f5e",
}

export default function RiskPieChart({
  low,
  medium,
  high,
  height = 240,
  className,
}: RiskPieChartProps) {
  const data: RiskDatum[] = [
    { name: "低风险", value: low, color: RISK_COLORS.low },
    { name: "中风险", value: medium, color: RISK_COLORS.medium },
    { name: "高风险", value: high, color: RISK_COLORS.high },
  ]
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: PieLabelRenderProps) => {
    if (!percent || percent <= 0 || midAngle === undefined) {
      return null
    }
    const inner = Number(innerRadius)
    const outer = Number(outerRadius)
    const radius = inner + (outer - inner) * 0.5
    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN)
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    )
  }

  const tooltipContent = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: RiskDatum }> }) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }
    const datum = payload[0].payload as RiskDatum
    const percent = total ? Math.round((datum.value / total) * 100) : 0
    return (
      <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-lg">
        <div className="flex items-center gap-2 text-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: datum.color }}
          />
          <span>{datum.name}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 text-muted-foreground">
          <span>{datum.value} 个</span>
          <span>{percent}%</span>
        </div>
      </div>
    )
  }

  if (total <= 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        暂无风险分布数据
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              stroke="transparent"
              labelLine={false}
              label={renderLabel}
            >
              {data.map((entry) => (
                <Cell key={`risk-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={tooltipContent} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">总计</span>
          <span className="text-2xl font-semibold text-foreground">
            {total}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        {data.map((entry) => (
          <div key={`legend-${entry.name}`} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
