import { useMemo, useState } from "react"

import Pagination from "@/components/common/Pagination"
import TaskTable from "@/components/admin/TaskTable"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminTasks, useCancelTask, useDeleteTask, useExecuteTask, useTaskTypes, useUpdateTask } from "@/hooks/use-admin"
import type { AdminTasksQueryParams, Task, TaskPriority, TaskTypeOption } from "@/types"

const statusOptions = [
  { value: "PENDING", label: "等待中" },
  { value: "RUNNING", label: "运行中" },
  { value: "SUCCESS", label: "成功" },
  { value: "FAILED", label: "失败" },
  { value: "CANCELLED", label: "已取消" },
]

const priorityOptions: TaskPriority[] = [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
]

const buildFormValues = (task?: Task) => ({
  name: task?.name ?? "",
  description: task?.description ?? "",
  cron_expression: task?.cron_expression ?? "",
  priority: task?.priority ?? "NORMAL",
  enabled: task?.enabled ? "true" : "false",
  timeout: String(task?.timeout ?? 0),
  max_retries: String(task?.max_retries ?? 0),
  retry_interval: String(task?.retry_interval ?? 0),
  concurrency: String(task?.concurrency ?? 0),
  single_run: task?.single_run ? "true" : "false",
})

type TaskEditDialogProps = {
  open: boolean
  task?: Task | null
  saving?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task, values: ReturnType<typeof buildFormValues>) => void
}

function TaskEditDialog({
  open,
  task,
  saving = false,
  onOpenChange,
  onSave,
}: TaskEditDialogProps) {
  const [formValues, setFormValues] = useState(() =>
    buildFormValues(task ?? undefined)
  )

  if (!task) {
    return null
  }

  const handleSave = () => {
    onSave(task, formValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>任务名称</span>
              <Input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>任务描述</span>
              <Input
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>Cron 表达式</span>
              <Input
                value={formValues.cron_expression}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    cron_expression: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>优先级</span>
              <Select
                value={formValues.priority}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    priority: value as TaskPriority,
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={`priority-${option}`} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>启用状态</span>
              <Select
                value={formValues.enabled}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    enabled: value,
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">启用</SelectItem>
                  <SelectItem value="false">停用</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>超时 (秒)</span>
              <Input
                type="number"
                value={formValues.timeout}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    timeout: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>最大重试</span>
              <Input
                type="number"
                value={formValues.max_retries}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    max_retries: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>重试间隔 (秒)</span>
              <Input
                type="number"
                value={formValues.retry_interval}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    retry_interval: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>并发数</span>
              <Input
                type="number"
                value={formValues.concurrency}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    concurrency: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>单次执行</span>
              <Select
                value={formValues.single_run}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    single_run: value,
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function TasksPage() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [enabledFilter, setEnabledFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editOpen, setEditOpen] = useState(false)

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
  const tasks = useMemo(
    () => tasksQuery.data?.data ?? [],
    [tasksQuery.data?.data]
  )
  const pagination = tasksQuery.data?.pagination

  const typeOptions = useMemo<TaskTypeOption[]>(() => {
    const apiTypes = taskTypesQuery.data?.data ?? []
    const apiTypeValues = new Set(apiTypes.map((t) => t.value))
    const taskTypes = tasks
      .map((task) => task.type)
      .filter((type): type is string => Boolean(type) && !apiTypeValues.has(type))
    const extraTypes: TaskTypeOption[] = Array.from(new Set(taskTypes)).map((type) => ({
      value: type,
      label: type,
      description: "",
      parameters: {},
    }))
    return [...apiTypes, ...extraTypes]
  }, [taskTypesQuery.data?.data, tasks])

  const executeMutation = useExecuteTask()
  const cancelMutation = useCancelTask()
  const deleteMutation = useDeleteTask()
  const updateMutation = useUpdateTask()

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

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setEditOpen(true)
  }

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open)
    if (!open) {
      setEditingTask(null)
    }
  }

  const handleSave = (task: Task, values: ReturnType<typeof buildFormValues>) => {
    const toNumber = (value: string, fallback: number) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : fallback
    }

    updateMutation.mutate(
      {
        id: task.id,
        task: {
          name: values.name.trim() || task.name,
          description: values.description.trim() || task.description,
          cron_expression: values.cron_expression.trim() || task.cron_expression,
          priority: values.priority as TaskPriority,
          enabled: values.enabled === "true",
          timeout: toNumber(values.timeout, task.timeout),
          max_retries: toNumber(values.max_retries, task.max_retries),
          retry_interval: toNumber(values.retry_interval, task.retry_interval),
          concurrency: toNumber(values.concurrency, task.concurrency),
          single_run: values.single_run === "true",
        },
      },
      {
        onSuccess: () => handleEditOpenChange(false),
      }
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">任务管理</h1>
        <p className="text-sm text-muted-foreground">
          管理后台任务、调度状态与执行记录
        </p>
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

      <TaskTable
        tasks={tasks}
        loading={tasksQuery.isLoading}
        error={tasksQuery.isError}
        onExecute={(task) => executeMutation.mutate(task.id)}
        onCancel={(task) => cancelMutation.mutate(task.id)}
        onEdit={handleEdit}
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

      <TaskEditDialog
        key={editingTask?.id ?? "task-editor"}
        open={editOpen}
        task={editingTask}
        saving={updateMutation.isPending}
        onOpenChange={handleEditOpenChange}
        onSave={handleSave}
      />
    </div>
  )
}
