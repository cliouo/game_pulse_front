import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type PotentialFilters = {
  releaseStatus: "all" | "released" | "coming_soon"
  potentialScoreRange: [number, number]
  riskLevels: Array<"LOW" | "MEDIUM" | "HIGH">
  investmentCategories: Array<"INDIE" | "MID_BUDGET" | "AAA">
  minFollowers: string
  minReviewScore: string
  maxPrice: string
  hasDiscount: boolean
}

type FilterPanelProps = {
  filters: PotentialFilters
  onFiltersChange: (filters: PotentialFilters) => void
  onReset: () => void
  className?: string
}

const riskOptions: Array<{ value: PotentialFilters["riskLevels"][number]; label: string }> = [
  { value: "LOW", label: "低风险" },
  { value: "MEDIUM", label: "中风险" },
  { value: "HIGH", label: "高风险" },
]

const investmentOptions: Array<{
  value: PotentialFilters["investmentCategories"][number]
  label: string
}> = [
  { value: "INDIE", label: "独立游戏" },
  { value: "MID_BUDGET", label: "中型" },
  { value: "AAA", label: "3A" },
]

const toggleValue = <T,>(list: T[], value: T) => {
  if (list.includes(value)) {
    return list.filter((item) => item !== value)
  }
  return [...list, value]
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  className,
}: FilterPanelProps) {
  const [minScore, maxScore] = filters.potentialScoreRange

  const handleMinScoreChange = (value: number) => {
    const nextMin = Math.min(value, maxScore)
    onFiltersChange({
      ...filters,
      potentialScoreRange: [nextMin, maxScore],
    })
  }

  const handleMaxScoreChange = (value: number) => {
    const nextMax = Math.max(value, minScore)
    onFiltersChange({
      ...filters,
      potentialScoreRange: [minScore, nextMax],
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">筛选条件</p>
        <Button variant="ghost" size="sm" onClick={onReset}>
          重置
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">发售状态</p>
        <Select
          value={filters.releaseStatus}
          onValueChange={(value: PotentialFilters["releaseStatus"]) =>
            onFiltersChange({ ...filters, releaseStatus: value })
          }
        >
          <SelectTrigger className="h-8 border-border/60 bg-background/60">
            <SelectValue placeholder="发售状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="released">已发售</SelectItem>
            <SelectItem value="coming_soon">即将发售</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>潜力评分范围</span>
          <span>
            {minScore} - {maxScore}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={100}
            value={minScore}
            onChange={(event) => handleMinScoreChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-primary"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={maxScore}
            onChange={(event) => handleMaxScoreChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-primary"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>最低</span>
          <span>最高</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">风险等级</p>
        <div className="flex flex-wrap gap-2">
          {riskOptions.map((option) => {
            const active = filters.riskLevels.includes(option.value)
            return (
              <Button
                key={option.value}
                type="button"
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    riskLevels: toggleValue(filters.riskLevels, option.value),
                  })
                }
              >
                {option.label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">投资类别</p>
        <div className="flex flex-wrap gap-2">
          {investmentOptions.map((option) => {
            const active = filters.investmentCategories.includes(option.value)
            return (
              <Button
                key={option.value}
                type="button"
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    investmentCategories: toggleValue(
                      filters.investmentCategories,
                      option.value
                    ),
                  })
                }
              >
                {option.label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">关注数 ≥</p>
          <Input
            type="number"
            min={0}
            value={filters.minFollowers}
            onChange={(event) =>
              onFiltersChange({ ...filters, minFollowers: event.target.value })
            }
            className="h-8 border-border/60 bg-background/60"
            placeholder="最小值"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">评分 ≥</p>
          <Input
            type="number"
            min={0}
            max={100}
            value={filters.minReviewScore}
            onChange={(event) =>
              onFiltersChange({ ...filters, minReviewScore: event.target.value })
            }
            className="h-8 border-border/60 bg-background/60"
            placeholder="最小值"
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">最高价格</p>
        <Input
          type="number"
          min={0}
          value={filters.maxPrice}
          onChange={(event) =>
            onFiltersChange({ ...filters, maxPrice: event.target.value })
          }
          className="h-8 border-border/60 bg-background/60"
          placeholder="输入价格"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <div className="space-y-0.5">
          <p className="text-xs font-medium">是否有折扣</p>
          <p className="text-[10px] text-muted-foreground">仅显示折扣游戏</p>
        </div>
        <button
          type="button"
          aria-pressed={filters.hasDiscount}
          onClick={() =>
            onFiltersChange({
              ...filters,
              hasDiscount: !filters.hasDiscount,
            })
          }
          className={cn(
            "relative h-6 w-11 rounded-full border border-border/60 transition",
            filters.hasDiscount ? "bg-emerald-400/70" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
              filters.hasDiscount ? "translate-x-5" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </div>
  )
}
