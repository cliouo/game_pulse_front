import { useState } from "react"
import { Outlet } from "react-router-dom"

import { PageBackground } from "@/components/common/PageBackground"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageBackground />
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        className="fixed inset-y-0 left-0 hidden pt-16 lg:flex"
      />
      <Header
        sidebar={collapsed ? "collapsed" : "expanded"}
        onOpenMobile={() => setMobileOpen(true)}
      />
      <main
        className={cn(
          "pt-16 transition-all",
          collapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <div className="px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar
            className="h-full w-full"
            onNavigate={() => setMobileOpen(false)}
            showToggle={false}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
