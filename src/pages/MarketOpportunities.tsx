import OpportunityCard from "@/components/market/OpportunityCard"
import { Button } from "@/components/ui/button"
import { useMarketOpportunities } from "@/hooks/use-publisher"

const placeholderItems = Array.from({ length: 4 })

export default function MarketOpportunities() {
  const query = useMarketOpportunities()
  const opportunities = query.data?.data ?? []
  const isEmpty =
    !query.isLoading && !query.isError && opportunities.length === 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">市场机会分析</h1>
        <p className="text-sm text-muted-foreground">
          发现潜在的游戏发行机会
        </p>
      </div>

      {query.isError ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
          <span>市场机会数据加载失败，请稍后重试。</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            重试
          </Button>
        </div>
      ) : null}

      {query.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {placeholderItems.map((_, index) => (
            <OpportunityCard key={`opportunity-loading-${index}`} loading />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
          暂无市场机会数据
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {opportunities.map((opportunity, index) => (
            <OpportunityCard
              key={`opportunity-${opportunity.title}-${index}`}
              opportunity={opportunity}
            />
          ))}
        </div>
      )}
    </div>
  )
}
