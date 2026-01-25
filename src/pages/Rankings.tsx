import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

import RankingTable from "@/components/common/RankingTable"
import TopPlayersTable from "@/components/rankings/TopPlayersTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTopSelling, useTopWishlist } from "@/hooks/use-rankings"
import { useTopPlayers } from "@/hooks/use-stats"

const limitOptions = ["10", "20", "50", "100"]

const formatRecordTime = (value?: string) => {
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

export default function Rankings() {
  const [limit, setLimit] = useState("10")
  const [activeTab, setActiveTab] = useState("topselling")
  const limitValue = Number(limit) || 10

  const topSellingQuery = useTopSelling(limitValue)
  const topWishlistQuery = useTopWishlist(limitValue)
  const topPlayersQuery = useTopPlayers(limitValue)

  const topSellingRecords = topSellingQuery.data?.data ?? []
  const topWishlistRecords = topWishlistQuery.data?.data ?? []
  const topPlayersRecords = topPlayersQuery.data?.data ?? []

  const recordTime =
    activeTab === "topselling"
      ? topSellingRecords[0]?.record_time
      : activeTab === "wishlist"
        ? topWishlistRecords[0]?.record_time
        : topPlayersRecords[0]?.collected_at
  const recordLoading =
    activeTab === "topselling"
      ? topSellingQuery.isLoading
      : activeTab === "wishlist"
        ? topWishlistQuery.isLoading
        : topPlayersQuery.isLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Steam 排行榜</h1>
          {recordLoading ? (
            <Skeleton className="h-4 w-44" />
          ) : (
            <p className="text-sm text-muted-foreground">
              数据记录时间: {formatRecordTime(recordTime)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">显示数量</span>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-[120px] border-border/60 bg-background/60">
              <SelectValue placeholder="Top N" />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  Top {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="topselling">畅销榜</TabsTrigger>
          <TabsTrigger value="wishlist">愿望单榜</TabsTrigger>
          <TabsTrigger value="players">在线人数榜</TabsTrigger>
        </TabsList>

        <TabsContent value="topselling">
          <RankingTable
            records={topSellingRecords}
            loading={topSellingQuery.isLoading}
            count={limitValue}
          />
        </TabsContent>

        <TabsContent value="wishlist">
          <RankingTable
            records={topWishlistRecords}
            loading={topWishlistQuery.isLoading}
            count={limitValue}
          />
        </TabsContent>

        <TabsContent value="players">
          <TopPlayersTable
            records={topPlayersRecords}
            loading={topPlayersQuery.isLoading}
            count={limitValue}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
