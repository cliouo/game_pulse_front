import axios from "axios"
import { useEffect, useMemo, useRef, useState } from "react"
import type { CheckedState } from "@radix-ui/react-checkbox"

import gamesApi from "@/api/games"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useAddWhitelistGame,
  useCrawlScope,
  useImportWhitelistFromConfig,
  useRemoveWhitelistGame,
  useUpdateCrawlScope,
  useWhitelistGames,
} from "@/hooks/use-admin"
import type { GameWithStats, SystemSetting } from "@/types"

const ALL_TASK_TYPES = [
  { value: "steamdb_metadata", label: "SteamDB Metadata" },
  { value: "steamdb_history", label: "SteamDB History" },
  { value: "stats", label: "Stats" },
  { value: "store_details", label: "Store Details" },
  { value: "steam_news", label: "Steam News" },
  { value: "steam_reviews", label: "Steam Reviews" },
  { value: "steamspy", label: "SteamSpy" },
  { value: "protondb", label: "ProtonDB" },
  { value: "igdb", label: "IGDB" },
  { value: "itad", label: "ITAD" },
  { value: "hltb", label: "HLTB" },
  { value: "steamdb_player_monitor", label: "Player Monitor" },
] as const

function settingsToMap(settings: SystemSetting[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const setting of settings) {
    map[setting.key] = setting.value
  }
  return map
}

function toBoolean(checked: CheckedState) {
  return checked === true
}

function isCanceledRequest(error: unknown) {
  return axios.isCancel(error) || (error instanceof Error && error.name === "CanceledError")
}

export default function CrawlScopePage() {
  const { data: scopeData, isLoading } = useCrawlScope()
  const updateScope = useUpdateCrawlScope()
  const whitelistGames = useWhitelistGames()
  const addGame = useAddWhitelistGame()
  const removeGame = useRemoveWhitelistGame()
  const importConfig = useImportWhitelistFromConfig()

  const whitelistAppIds = useMemo(
    () => new Set((whitelistGames.data?.data ?? []).map((game) => game.app_id)),
    [whitelistGames.data?.data]
  )

  const [rankingMax, setRankingMax] = useState("500")
  const [steamRankingMax, setSteamRankingMax] = useState("1000")
  const [perGameLimit, setPerGameLimit] = useState("0")
  const [whitelistEnabled, setWhitelistEnabled] = useState(false)
  const [disabledTypes, setDisabledTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<GameWithStats[]>([])
  const [searching, setSearching] = useState(false)
  const [dirty, setDirty] = useState(false)
  const searchControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      searchControllerRef.current?.abort()
      searchControllerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!scopeData?.data) {
      return
    }

    const map = settingsToMap(scopeData.data)
    setRankingMax(map["crawl_scope.ranking_max_entries"] ?? "500")
    setSteamRankingMax(map["crawl_scope.steam_ranking_max_count"] ?? "1000")
    setPerGameLimit(map["crawl_scope.per_game_limit"] ?? "0")
    setWhitelistEnabled(map["crawl_scope.whitelist_enabled"] === "true")

    try {
      setDisabledTypes(JSON.parse(map["crawl_scope.disabled_task_types"] ?? "[]"))
    } catch {
      setDisabledTypes([])
    }

    setDirty(false)
  }, [scopeData])

  const handleSave = () => {
    updateScope.mutate(
      {
        "crawl_scope.ranking_max_entries": rankingMax,
        "crawl_scope.steam_ranking_max_count": steamRankingMax,
        "crawl_scope.per_game_limit": perGameLimit,
        "crawl_scope.whitelist_enabled": String(whitelistEnabled),
        "crawl_scope.disabled_task_types": JSON.stringify(disabledTypes),
      },
      {
        onSuccess: () => {
          setDirty(false)
        },
      }
    )
  }

  const handleToggleTaskType = (type: string, checked: CheckedState) => {
    const enabled = toBoolean(checked)
    setDisabledTypes((prev) =>
      enabled ? prev.filter((item) => item !== type) : [...prev, type]
    )
    setDirty(true)
  }

  const handleSearch = async () => {
    const keyword = searchQuery.trim()

    searchControllerRef.current?.abort()
    searchControllerRef.current = null

    if (!keyword) {
      setSearchResults([])
      setSearching(false)
      return
    }

    const controller = new AbortController()
    searchControllerRef.current = controller
    setSearching(true)
    try {
      const response = await gamesApi.searchGames(keyword, controller.signal)
      if (searchControllerRef.current === controller) {
        setSearchResults(response.data ?? [])
      }
    } catch (error) {
      if (isCanceledRequest(error)) {
        return
      }
      if (searchControllerRef.current === controller) {
        setSearchResults([])
      }
    } finally {
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null
        setSearching(false)
      }
    }
  }

  const handleAddGame = (appId: number) => {
    addGame.mutate(appId, {
      onSuccess: () => {
        setSearchResults([])
        setSearchQuery("")
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">采集范围控制</h1>
          <p className="text-xs text-muted-foreground">控制各类采集任务的数据范围和白名单</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={!dirty || updateScope.isPending}>
          {updateScope.isPending ? "保存中..." : "保存配置"}
        </Button>
      </div>

      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">排行榜限制</CardTitle>
          <CardDescription className="text-xs">控制排行榜采集的最大条目数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">SteamDB 排行最大条目</label>
              <Input
                type="number"
                value={rankingMax}
                onChange={(event) => {
                  setRankingMax(event.target.value)
                  setDirty(true)
                }}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Steam 排行最大条数</label>
              <Input
                type="number"
                value={steamRankingMax}
                onChange={(event) => {
                  setSteamRankingMax(event.target.value)
                  setDirty(true)
                }}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">逐游戏采集上限 (0=不限)</label>
              <Input
                type="number"
                value={perGameLimit}
                onChange={(event) => {
                  setPerGameLimit(event.target.value)
                  setDirty(true)
                }}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm">游戏白名单</CardTitle>
              <CardDescription className="text-xs">启用后仅白名单游戏会采集详情数据</CardDescription>
            </div>
            <Switch
              checked={whitelistEnabled}
              onCheckedChange={(value) => {
                setWhitelistEnabled(value)
                setDirty(true)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="搜索添加游戏..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSearch()
                }
              }}
              className="h-8 flex-1 text-sm"
            />
            <Button size="sm" variant="outline" onClick={() => void handleSearch()} disabled={searching}>
              {searching ? "搜索中..." : "搜索"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => importConfig.mutate()}
              disabled={importConfig.isPending}
            >
              {importConfig.isPending ? "导入中..." : "从配置导入"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-1 rounded-md border border-border/60 bg-background/50 p-2">
              {searchResults.map((game) => {
                const exists = whitelistAppIds.has(game.app_id)
                return (
                  <div
                    key={game.app_id}
                    className="flex items-center justify-between gap-3 rounded px-2 py-1 text-xs hover:bg-muted/40"
                  >
                    <span className="truncate">
                      {game.name} ({game.app_id})
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => handleAddGame(game.app_id)}
                      disabled={exists || addGame.isPending}
                    >
                      {exists ? "已存在" : "添加"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-1">
            {whitelistGames.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : whitelistGames.data?.data?.length ? (
              whitelistGames.data.data.map((game) => (
                <div
                  key={game.app_id}
                  className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{game.name || `App ${game.app_id}`}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {game.app_id}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-destructive hover:text-destructive"
                    onClick={() => removeGame.mutate(game.app_id)}
                    disabled={removeGame.isPending}
                  >
                    移除
                  </Button>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">暂无白名单游戏</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">任务类型控制</CardTitle>
          <CardDescription className="text-xs">按任务类型批量禁用（不影响已有 enabled 开关）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {ALL_TASK_TYPES.map((taskType) => {
              const enabled = !disabledTypes.includes(taskType.value)
              return (
                <label
                  key={taskType.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-xs hover:bg-muted/40"
                >
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={(checked) => handleToggleTaskType(taskType.value, checked)}
                  />
                  <span>{taskType.label}</span>
                </label>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
