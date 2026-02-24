import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

import Pagination from "@/components/common/Pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBestDeals } from "@/hooks/use-deals"
import { useCurrentSales } from "@/hooks/use-steam-metadata"
import type { GameDealInfo, SteamSaleInfo } from "@/types"

const skeletonRows = Array.from({ length: 5 })

const currencySymbolMap: Record<string, string> = {
  CNY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
}

const formatPrice = (value: number, currency: string) => {
  const symbol = currencySymbolMap[currency] ?? currency
  return `${symbol}${value.toFixed(2)}`
}

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()

const getCurrencyFormatter = (currency: string) => {
  const cached = currencyFormatterCache.get(currency)
  if (cached) {
    return cached
  }

  const formatter = new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  currencyFormatterCache.set(currency, formatter)
  return formatter
}

const formatDealPrice = (cents: number, currency: string) => {
  const value = cents / 100
  const symbol = currencySymbolMap[currency] ?? currency

  try {
    const formatter = getCurrencyFormatter(currency)
    return formatter
      .formatToParts(value)
      .map((part) => (part.type === "currency" ? symbol : part.value))
      .join("")
  } catch {
    const normalized = new Intl.NumberFormat("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
    return `${symbol}${normalized}`
  }
}

export default function Deals() {
  const [activeTab, setActiveTab] = useState("best-deals")

  const [bestDealsPage, setBestDealsPage] = useState(1)
  const [bestDealsPageSize, setBestDealsPageSize] = useState(20)

  const [salesPage, setSalesPage] = useState(1)
  const [salesPageSize, setSalesPageSize] = useState(20)

  const bestDealsQuery = useBestDeals(bestDealsPage, bestDealsPageSize)
  const currentSalesQuery = useCurrentSales(salesPage, salesPageSize)

  const bestDeals: GameDealInfo[] = bestDealsQuery.data?.data ?? []
  const bestDealsTotal = bestDealsQuery.data?.pagination?.total ?? 0

  const currentSales: SteamSaleInfo[] = currentSalesQuery.data?.data ?? []
  const currentSalesTotal = currentSalesQuery.data?.pagination?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">促销与折扣</h1>
        <p className="text-sm text-muted-foreground">
          跨平台折扣信息与 Steam 实时促销
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="best-deals">最佳折扣</TabsTrigger>
          <TabsTrigger value="steam-sales">Steam 促销</TabsTrigger>
        </TabsList>

        <TabsContent value="best-deals" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[120px]">商店</TableHead>
                    <TableHead className="w-[140px]">当前价格</TableHead>
                    <TableHead className="w-[140px]">原价</TableHead>
                    <TableHead className="w-[120px]">折扣</TableHead>
                    <TableHead className="w-[140px]">历史最低</TableHead>
                    <TableHead className="w-[90px]">购买链接</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestDealsQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`best-deals-loading-${index}`}>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-44" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-14" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-8" />
                          </TableCell>
                        </TableRow>
                      ))
                    : bestDeals.length > 0
                      ? bestDeals.map((record) => (
                          <TableRow key={`best-deal-${record.id}`}>
                            <TableCell>
                              <Link
                                to={`/games/app/${record.app_id}`}
                                className="font-medium text-foreground transition hover:text-primary"
                              >
                                {record.app_id}
                              </Link>
                            </TableCell>
                            <TableCell>{record.store}</TableCell>
                            <TableCell className="font-medium text-emerald-600">
                              {formatDealPrice(record.current_price, record.currency)}
                            </TableCell>
                            <TableCell className="text-muted-foreground line-through">
                              {formatDealPrice(record.regular_price, record.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive" className="min-w-14 justify-center">
                                -{Math.round(record.discount_percent)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDealPrice(record.historical_low, record.currency)}
                            </TableCell>
                            <TableCell>
                              <a
                                href={record.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex text-muted-foreground transition hover:text-foreground"
                                aria-label={`打开商店购买链接: ${record.app_id}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </TableCell>
                          </TableRow>
                        ))
                      : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Pagination
            page={bestDealsPage}
            pageSize={bestDealsPageSize}
            total={bestDealsTotal}
            onPageChange={setBestDealsPage}
            onPageSizeChange={(value) => {
              setBestDealsPageSize(value)
              setBestDealsPage(1)
            }}
          />
        </TabsContent>

        <TabsContent value="steam-sales" className="space-y-4">
          <Card className="border-border/60 bg-card/60 shadow-sm">
            <CardContent className="pt-4">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>游戏</TableHead>
                    <TableHead className="w-[160px]">原价</TableHead>
                    <TableHead className="w-[160px]">促销价</TableHead>
                    <TableHead className="w-[120px]">折扣</TableHead>
                    <TableHead className="w-[100px]">货币</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSalesQuery.isLoading
                    ? skeletonRows.map((_, index) => (
                        <TableRow key={`steam-sales-loading-${index}`}>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-44" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-14" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                        </TableRow>
                      ))
                    : currentSales.length > 0
                      ? currentSales.map((record) => (
                          <TableRow key={`steam-sales-${record.app_id}-${record.detected_at}`}>
                            <TableCell>
                              <Link
                                to={`/games/app/${record.app_id}`}
                                className="font-medium text-foreground transition hover:text-primary"
                              >
                                {record.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground line-through">
                              {formatPrice(record.original_price, record.currency)}
                            </TableCell>
                            <TableCell className="font-semibold text-emerald-600">
                              {formatPrice(record.sale_price, record.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive" className="min-w-14 justify-center">
                                -{Math.round(record.discount_percent)}%
                              </Badge>
                            </TableCell>
                            <TableCell>{record.currency}</TableCell>
                          </TableRow>
                        ))
                      : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Pagination
            page={salesPage}
            pageSize={salesPageSize}
            total={currentSalesTotal}
            onPageChange={setSalesPage}
            onPageSizeChange={(value) => {
              setSalesPageSize(value)
              setSalesPage(1)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
