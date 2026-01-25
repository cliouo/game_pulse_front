import { Bell, Menu, Search } from "lucide-react"
import { useLocation } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type HeaderProps = {
  sidebar?: "none" | "collapsed" | "expanded"
  onOpenMobile?: () => void
  showMobileMenu?: boolean
}

const getTitle = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, "") || "/"
  if (normalized === "/") return "仪表板"
  if (normalized.startsWith("/rankings")) return "排行榜"
  if (normalized.startsWith("/games")) return "游戏库"
  if (normalized.startsWith("/potential")) return "潜力游戏"
  if (normalized.startsWith("/market")) return "市场机会"
  if (normalized.startsWith("/admin")) return "管理后台"
  return "GamePulse"
}

export default function Header({
  sidebar = "expanded",
  onOpenMobile,
  showMobileMenu = true,
}: HeaderProps) {
  const { pathname } = useLocation()
  const title = getTitle(pathname)
  const sidebarPadding =
    sidebar === "expanded" ? "lg:pl-64" : sidebar === "collapsed" ? "lg:pl-20" : ""

  return (
    <header
      className={cn(
        "fixed top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur",
        sidebarPadding
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {showMobileMenu ? (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobile}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        ) : null}

        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            实时洞察游戏趋势与市场信号
          </p>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索游戏、发行商..."
              className="w-56 border-border/60 bg-background/60 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar className="h-9 w-9 border border-border/60">
            <AvatarImage
              src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=96&h=96&q=80"
              alt="User avatar"
            />
            <AvatarFallback>GP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
