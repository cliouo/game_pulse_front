import { Outlet } from "react-router-dom"

import Header from "@/components/layout/Header"

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sidebar="none" showMobileMenu={false} />
      <main className="pt-16">
        <div className="px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
