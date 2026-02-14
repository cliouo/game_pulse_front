import type { RouteObject } from "react-router-dom"

import AdminLayout from "@/components/layout/AdminLayout"
import MainLayout from "@/components/layout/MainLayout"
import Dashboard from "@/pages/Dashboard"
import Games from "@/pages/Games"
import MarketOpportunities from "@/pages/MarketOpportunities"
import PotentialGames from "@/pages/PotentialGames"
import Rankings from "@/pages/Rankings"
import SteamDB from "@/pages/SteamDB"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import TasksPage from "@/pages/admin/TasksPage"

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "rankings", element: <Rankings /> },
      { path: "games", element: <Games /> },
      { path: "potential", element: <PotentialGames /> },
      { path: "market", element: <MarketOpportunities /> },
      { path: "steamdb", element: <SteamDB /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "tasks", element: <TasksPage /> },
    ],
  },
]
