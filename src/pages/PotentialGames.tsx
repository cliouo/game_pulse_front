import { useMemo, useState } from "react"
import { Filter } from "lucide-react"

import Pagination from "@/components/common/Pagination"
import FilterPanel, {
  type PotentialFilters,
} from "@/components/potential/FilterPanel"
import PotentialGameCard from "@/components/potential/PotentialGameCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePotentialGames } from "@/hooks/use-publisher"
import type { PotentialGamesQueryParams } from "@/types"

const placeholderItems = Array.from({ length: 6 })

const defaultFilters: PotentialFilters = {
  releaseStatus: "all",
  potentialScoreRange: [0, 100],
  riskLevels: [],
  investmentCategories: [],
  minFollowers: "",
  minReviewScore: "",
  maxPrice: "",
  hasDiscount: false,
}

const parseNumber = (value: string) => {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export default function PotentialGames() {
  const [filters, setFilters] = useState<PotentialFilters>(defaultFilters)
  const [sortBy, setSortBy] =
    useState<PotentialGamesQueryParams["sort_by"]>("potential_score")
  const [sortOrder, setSortOrder] =
    useState<PotentialGamesQueryParams["sort_order"]>("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const handleFiltersChange = (nextFilters: PotentialFilters) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const params = useMemo<PotentialGamesQueryParams>(
    () => ({
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
      release_status: filters.releaseStatus,
      min_potential_score: filters.potentialScoreRange[0],
      max_potential_score: filters.potentialScoreRange[1],
      risk_levels: filters.riskLevels.length
        ? filters.riskLevels.join(",")
        : undefined,
      investment_categories: filters.investmentCategories.length
        ? filters.investmentCategories.join(",")
        : undefined,
      min_followers: parseNumber(filters.minFollowers),
      min_review_score: parseNumber(filters.minReviewScore),
      max_price: parseNumber(filters.maxPrice),
      has_discount: filters.hasDiscount ? true : undefined,
    }),
    [filters, page, pageSize, sortBy, sortOrder]
  )

  const query = usePotentialGames(params)
  const games = query.data?.data ?? []
  const total = query.data?.pagination?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">潜力游戏</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value as PotentialGamesQueryParams["sort_by"])
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[160px] border-border/60 bg-background/60">
              <SelectValue placeholder="排序字段" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="potential_score">潜力评分</SelectItem>
              <SelectItem value="wishlist_rank">愿望单排名</SelectItem>
              <SelectItem value="followers">关注数</SelectItem>
              <SelectItem value="review_score">评分</SelectItem>
              <SelectItem value="price">价格</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as PotentialGamesQueryParams["sort_order"])
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[120px] border-border/60 bg-background/60">
              <SelectValue placeholder="排序方向" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">降序</SelectItem>
              <SelectItem value="asc">升序</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 lg:hidden"
              >
                <Filter className="h-4 w-4" />
                筛选
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:max-w-md">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={() => {
                  setFilters(defaultFilters)
                  setPage(1)
                }}
                className="mt-6"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="hidden border-border/60 bg-card/60 lg:block">
          <CardContent className="p-4">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={() => {
                setFilters(defaultFilters)
                setPage(1)
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {query.isError ? (
            <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center">
              <span>潜力游戏加载失败，请稍后重试。</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                重试
              </Button>
            </div>
          ) : query.isLoading ? (
            <div className="space-y-4">
              {placeholderItems.map((_, index) => (
                <PotentialGameCard key={`potential-loading-${index}`} loading />
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="space-y-4">
              {games.map((game) => (
                <PotentialGameCard key={`potential-${game.id}`} game={game} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
              暂无潜力游戏
            </div>
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value)
              setPage(1)
            }}
          />
        </div>
      </div>
    </div>
  )
}
