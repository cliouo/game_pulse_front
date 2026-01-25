import { useState } from "react"
import { LayoutGrid, List, Search } from "lucide-react"

import GameCard from "@/components/common/GameCard"
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

const placeholderItems = Array.from({ length: 8 })

export default function Games() {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">游戏库</h1>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索游戏名称、标签..."
            className="border-border/60 bg-background/60 pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] border-border/60 bg-background/60">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="rpg">RPG</SelectItem>
              <SelectItem value="strategy">策略</SelectItem>
              <SelectItem value="sim">模拟</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="hot">
            <SelectTrigger className="w-[140px] border-border/60 bg-background/60">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">热度优先</SelectItem>
              <SelectItem value="rating">评分优先</SelectItem>
              <SelectItem value="price">价格优先</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            size="icon"
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          view === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-4"
        )}
      >
        {placeholderItems.map((_, index) => (
          <GameCard key={`game-card-${index}`} loading layout={view} />
        ))}
      </div>
    </div>
  )
}
