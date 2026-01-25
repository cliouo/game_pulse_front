import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const placeholderItems = Array.from({ length: 4 })

export default function MarketOpportunities() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">市场机会</h1>
      <div className="grid gap-4">
        {placeholderItems.map((_, index) => (
          <Card key={`opportunity-${index}`} className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                机会卡片
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
