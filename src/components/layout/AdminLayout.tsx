import { NavLink, Outlet } from "react-router-dom"

import { cn } from "@/lib/utils"

export default function AdminLayout() {
  const navItemBase =
    "flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition lg:justify-start"
  const navItemActive = "bg-primary/15 text-primary shadow-sm"
  const navItemIdle =
    "text-muted-foreground hover:bg-muted/60 hover:text-foreground"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
              GP
            </div>
            <span className="text-sm font-semibold tracking-wide">
              GamePulse Admin
            </span>
          </div>
          <NavLink
            to="/"
            className="text-xs text-muted-foreground transition hover:text-foreground"
          >
            返回主站
          </NavLink>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <aside className="border-b border-border/60 bg-card/40 lg:min-h-[calc(100vh-3rem)] lg:w-56 lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto px-3 py-2 lg:flex-col lg:gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                cn(navItemBase, isActive ? navItemActive : navItemIdle)
              }
            >
              概览
            </NavLink>
            <NavLink
              to="/admin/tasks"
              className={({ isActive }) =>
                cn(navItemBase, isActive ? navItemActive : navItemIdle)
              }
            >
              任务管理
            </NavLink>
            <NavLink
              to="/admin/crawl-scope"
              className={({ isActive }) =>
                cn(navItemBase, isActive ? navItemActive : navItemIdle)
              }
            >
              采集范围
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 px-4 py-4 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
