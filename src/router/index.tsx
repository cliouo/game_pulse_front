import type { RouteObject } from "react-router-dom"

import AdminLayout from "@/components/layout/AdminLayout"
import MainLayout from "@/components/layout/MainLayout"
import Dashboard from "@/pages/Dashboard"
import GameDetail from "@/pages/GameDetail"
import Games from "@/pages/Games"
import MarketOpportunities from "@/pages/MarketOpportunities"
import PotentialGames from "@/pages/PotentialGames"
import Rankings from "@/pages/Rankings"
import SteamDB from "@/pages/SteamDB"
import Deals from "@/pages/Deals"
import Charts from "@/pages/Charts"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import TaskDetailPage from "@/pages/admin/TaskDetailPage"
import TasksPage from "@/pages/admin/TasksPage"

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "rankings", element: <Rankings /> },
      { path: "games", element: <Games /> },
      { path: "games/app/:appId", element: <GameDetail /> },
      { path: "potential", element: <PotentialGames /> },
      { path: "market", element: <MarketOpportunities /> },
      { path: "steamdb", element: <SteamDB /> },
      { path: "deals", element: <Deals /> },
      { path: "charts", element: <Charts /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "tasks/:id", element: <TaskDetailPage /> },
    ],
  },
]
