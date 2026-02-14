import { NavLink } from "react-router-dom"
import {
  Database,
  Gamepad2,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SidebarProps = {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
  className?: string
  showToggle?: boolean
}

const navItems = [
  {
    label: "仪表板",
    href: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "排行榜",
    href: "/rankings",
    icon: Trophy,
  },
  {
    label: "游戏库",
    href: "/games",
    icon: Gamepad2,
  },
  {
    label: "潜力游戏",
    href: "/potential",
    icon: TrendingUp,
  },
  {
    label: "市场机会",
    href: "/market",
    icon: Target,
  },
  {
    label: "SteamDB",
    href: "/steamdb",
    icon: Database,
  },
]

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  className,
  showToggle = true,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/60 bg-card/30 backdrop-blur",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-5">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "w-full justify-center" : ""
          )}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_16px_rgba(168,85,247,0.35)]">
            <span className="text-sm font-bold tracking-wide">GP</span>
          </div>
          <div
            className={cn(
              "flex flex-col overflow-hidden transition-all",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <span className="text-lg font-semibold leading-none">
              Game
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
                Pulse
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Insight Hub
            </span>
          </div>
        </div>
        {showToggle && onToggleCollapse ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn("text-muted-foreground", collapsed ? "hidden" : "")}
          >
            <PanelLeftClose className="h-4 w-4" />
            <span className="sr-only">Collapse sidebar</span>
          </Button>
        ) : null}
      </div>

      {showToggle && onToggleCollapse && collapsed ? (
        <div className="px-3 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full text-muted-foreground"
          >
            <PanelLeftOpen className="h-4 w-4" />
            <span className="sr-only">Expand sidebar</span>
          </Button>
        </div>
      ) : null}

      <nav className="flex-1 space-y-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={onNavigate}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-primary/15 text-primary shadow-[0_0_12px_rgba(168,85,247,0.45)]"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className={cn("truncate", collapsed ? "sr-only" : "block")}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div
        className={cn(
          "px-4 pb-4 text-xs text-muted-foreground",
          collapsed ? "text-center" : "text-left"
        )}
      >
        v1.0.0
      </div>
    </aside>
  )
}
