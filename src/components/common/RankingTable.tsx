import { ExternalLink } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Link } from "react-router-dom"

import RankBadge from "@/components/rankings/RankBadge"
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
import { cn } from "@/lib/utils"
import type { RankingRecord } from "@/types"

type RankingTableProps = {
  records?: RankingRecord[]
  loading?: boolean
  count?: number
  className?: string
}

const formatRecordTime = (value?: string) => {
  if (!value) {
    return "--"
  }
  const parsed = parseISO(value)
  if (isValid(parsed)) {
    return format(parsed, "MM-dd HH:mm", { locale: zhCN })
  }
  const fallback = new Date(value)
  if (isValid(fallback)) {
    return format(fallback, "MM-dd HH:mm", { locale: zhCN })
  }
  return value
}

const getRowClassName = (rank: number) => {
  if (rank === 1) {
    return "bg-gradient-to-r from-amber-200/70 via-amber-50/50 to-transparent hover:bg-transparent hover:brightness-95"
  }
  if (rank === 2) {
    return "bg-gradient-to-r from-slate-200/70 via-slate-50/50 to-transparent hover:bg-transparent hover:brightness-95"
  }
  if (rank === 3) {
    return "bg-gradient-to-r from-amber-300/60 via-orange-50/40 to-transparent hover:bg-transparent hover:brightness-95"
  }
  return ""
}

export default function RankingTable({
  records = [],
  loading = false,
  count = 10,
  className,
}: RankingTableProps) {
  return (
    <Card className={cn("border-border/60 bg-card/60 shadow-sm", className)}>
      <CardContent className="pt-4">
        <Table className="min-w-[620px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">排名</TableHead>
              <TableHead className="hidden w-[100px] sm:table-cell">封面</TableHead>
              <TableHead>游戏</TableHead>
              <TableHead className="hidden w-[120px] md:table-cell">
                更新时间
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: count }).map((_, index) => (
                  <TableRow key={`loading-row-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-10 w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-20 flex-shrink-0 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              : records.length > 0
                ? records.map((record, index) => {
                    const steamUrl = record.app_id
                      ? `https://store.steampowered.com/app/${record.app_id}`
                      : undefined
                    return (
                      <TableRow
                        key={`ranking-${record.id}`}
                        className={cn(getRowClassName(index + 1))}
                      >
                        <TableCell className="w-[60px]">
                          <RankBadge rank={index + 1} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="h-10 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/40">
                            <img
                              src={`https://cdn.akamai.steamstatic.com/steam/apps/${record.app_id}/header.jpg`}
                              alt={record.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {record.header_image && (
                              <img
                                src={record.header_image}
                                alt={record.name}
                                className="h-12 w-20 flex-shrink-0 rounded border border-border/50 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/games/app/${record.app_id}`}
                                  className="text-sm font-medium text-foreground transition hover:text-primary"
                                >
                                  {record.name}
                                </Link>
                                {steamUrl ? (
                                  <a
                                    href={steamUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground transition hover:text-foreground"
                                    aria-label={`打开 ${record.name} Steam 商店`}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : null}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                App ID: {record.app_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                          {formatRecordTime(record.record_time)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
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
  )
}
