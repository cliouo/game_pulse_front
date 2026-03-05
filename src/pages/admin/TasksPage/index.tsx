import { useMemo, useState } from "react"

import TaskTable from "@/components/admin/TaskTable"
import Pagination from "@/components/common/Pagination"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAdminTasks,
  useCancelTask,
  useCreateTask,
  useDeleteTask,
  useExecuteTask,
  useTaskTypes,
  useUpdateTask,
  useValidateTaskParams,
} from "@/hooks/use-admin"
import type { AdminTasksQueryParams, Task, TaskTypeOption } from "@/types"

import TaskCreateDialog from "./TaskCreateDialog"
import TaskEditDialog from "./TaskEditDialog"
import { emptySchema, emptyUiSchema } from "./utils"

const statusOptions = [
  { value: "pending", label: "等待中" },
  { value: "running", label: "运行中" },
  { value: "completed", label: "成功" },
  { value: "failed", label: "失败" },
  { value: "cancelled", label: "已取消" },
]

export default function TasksPage() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [enabledFilter, setEnabledFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [executeFeedback, setExecuteFeedback] = useState<string | null>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)

  const taskTypesQuery = useTaskTypes()

  const params = useMemo<AdminTasksQueryParams>(
    () => ({
      page,
      page_size: pageSize,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      enabled:
        enabledFilter === "all" ? undefined : enabledFilter === "true",
    }),
    [page, pageSize, typeFilter, statusFilter, enabledFilter]
  )

  const tasksQuery = useAdminTasks(params)
  const tasks = useMemo(() => {
    const data = tasksQuery.data?.data
    return Array.isArray(data) ? data : []
  }, [tasksQuery.data?.data])
  const pagination = tasksQuery.data?.pagination

  const typeOptions = useMemo<TaskTypeOption[]>(() => {
    const apiData = taskTypesQuery.data?.data
    const apiTypes = Array.isArray(apiData) ? apiData : []
    const normalizedTypes = apiTypes.map((type) => ({
      ...type,
      schema: type.schema ?? emptySchema,
      ui_schema: type.ui_schema ?? emptyUiSchema,
    }))
    const apiTypeValues = new Set(normalizedTypes.map((t) => t.value))
    const taskTypes = tasks
      .map((task) => task.type)
      .filter(
        (type): type is Task["type"] => Boolean(type) && !apiTypeValues.has(type)
      )
    const extraTypes: TaskTypeOption[] = Array.from(new Set(taskTypes)).map(
      (type) => ({
        value: type,
        label: type,
        description: "",
        schema: emptySchema,
        ui_schema: emptyUiSchema,
      })
    )
    return [...normalizedTypes, ...extraTypes]
  }, [taskTypesQuery.data?.data, tasks])

  const executeMutation = useExecuteTask()
  const cancelMutation = useCancelTask()
  const createMutation = useCreateTask()
  const deleteMutation = useDeleteTask()
  const updateMutation = useUpdateTask()
  const validateMutation = useValidateTaskParams()

  const isMutationPending = (taskId: number) => {
    const isNumberMatch = (value: unknown) =>
      typeof value === "number" && value === taskId
    const isObjectMatch = (value: unknown) =>
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      (value as { id: number }).id === taskId

    return (
      (executeMutation.isPending && isNumberMatch(executeMutation.variables)) ||
      (cancelMutation.isPending && isNumberMatch(cancelMutation.variables)) ||
      (deleteMutation.isPending && isNumberMatch(deleteMutation.variables)) ||
      (updateMutation.isPending && isObjectMatch(updateMutation.variables))
    )
  }

  const validateTaskParams = async (
    taskType: string,
    parameters: Record<string, unknown>
  ) => {
    const response = await validateMutation.mutateAsync({
      taskType,
      parameters,
    })
    return response.data
  }

  const handleCreate = (payload: Partial<Task>) => {
    createMutation.mutate(payload, {
      onSuccess: () => setCreateOpen(false),
    })
  }

  const handleSave = (task: Task, payload: Partial<Task>) => {
    updateMutation.mutate(
      {
        id: task.id,
        task: {
          name: payload.name?.trim() || task.name,
          description: payload.description?.trim() || task.description,
          cron_expression: payload.cron_expression ?? task.cron_expression,
          priority: payload.priority ?? task.priority,
          enabled: payload.enabled ?? task.enabled,
          parameters: payload.parameters ?? task.parameters,
          timeout: payload.timeout ?? task.timeout,
          max_retries: payload.max_retries ?? task.max_retries,
          retry_interval: payload.retry_interval ?? task.retry_interval,
          concurrency: payload.concurrency ?? task.concurrency,
          single_run: payload.single_run ?? task.single_run,
        },
      },
      {
        onSuccess: () => setEditingTask(null),
      }
    )
  }

  const handleExecute = (task: Task) => {
    executeMutation.mutate(task.id, {
      onSuccess: () => {
        setExecuteFeedback("任务已触发")
        setExpandedTaskId(task.id)
      },
    })
  }

  const handleToggleEnabled = (task: Task) => {
    updateMutation.mutate({
      id: task.id,
      task: {
        enabled: !task.enabled,
      },
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">任务管理</h1>
          <p className="text-sm text-muted-foreground">
            管理后台任务、调度状态与执行记录
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          创建任务
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[160px] border-border/60 bg-background/60">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            {typeOptions.map((option) => (
              <SelectItem key={`type-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[140px] border-border/60 bg-background/60">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={`status-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={enabledFilter}
          onValueChange={(value) => {
            setEnabledFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[140px] border-border/60 bg-background/60">
            <SelectValue placeholder="启用状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="true">启用</SelectItem>
            <SelectItem value="false">停用</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {executeFeedback ? (
        <div className="text-xs text-muted-foreground">{executeFeedback}</div>
      ) : null}

      <TaskTable
        tasks={tasks}
        loading={tasksQuery.isLoading}
        error={tasksQuery.isError}
        onExecute={handleExecute}
        onCancel={(task) => cancelMutation.mutate(task.id)}
        onEdit={(task) => setEditingTask(task)}
        onToggleEnabled={handleToggleEnabled}
        defaultExpandedTaskId={expandedTaskId}
        onDelete={(task) => {
          if (window.confirm(`确定删除任务 “${task.name}” 吗？`)) {
            deleteMutation.mutate(task.id)
          }
        }}
        isActionPending={isMutationPending}
      />

      {pagination ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.page_size}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value)
            setPage(1)
          }}
          className="border-border/60 bg-card/60"
        />
      ) : null}

      <TaskCreateDialog
        open={createOpen}
        typeOptions={typeOptions}
        saving={createMutation.isPending}
        validating={validateMutation.isPending}
        onOpenChange={setCreateOpen}
        onValidate={validateTaskParams}
        onCreate={handleCreate}
      />
      {editingTask ? (
        <TaskEditDialog
          open={Boolean(editingTask)}
          task={editingTask}
          saving={updateMutation.isPending}
          validating={validateMutation.isPending}
          typeOptions={typeOptions}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTask(null)
            }
          }}
          onValidate={validateTaskParams}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}
