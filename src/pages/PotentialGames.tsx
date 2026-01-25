import GameCard from "@/components/common/GameCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const placeholderItems = Array.from({ length: 6 })

export default function PotentialGames() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">潜力游戏</h1>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-sm">筛选条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="all">
              <SelectTrigger className="border-border/60 bg-background/60">
                <SelectValue placeholder="风险等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部风险</SelectItem>
                <SelectItem value="low">低风险</SelectItem>
                <SelectItem value="medium">中风险</SelectItem>
                <SelectItem value="high">高风险</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="border-border/60 bg-background/60">
                <SelectValue placeholder="投资类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类别</SelectItem>
                <SelectItem value="indie">独立精品</SelectItem>
                <SelectItem value="aa">AA 级</SelectItem>
                <SelectItem value="mobile">移动端</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="最低评分"
                className="border-border/60 bg-background/60"
              />
              <Input
                placeholder="最高评分"
                className="border-border/60 bg-background/60"
              />
            </div>

            <Button className="w-full">应用筛选</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {placeholderItems.map((_, index) => (
            <GameCard key={`potential-game-${index}`} loading />
          ))}
        </div>
      </div>
    </div>
  )
}
