import Loading from "@/components/common/Loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理后台</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              任务队列
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Loading count={2} itemClassName="h-16" />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              调度状态
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Loading count={2} itemClassName="h-16" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
