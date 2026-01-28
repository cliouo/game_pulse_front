import { useEffect, useMemo, useState } from "react"

import Pagination from "@/components/common/Pagination"
import TaskTable from "@/components/admin/TaskTable"
import { SchemaForm, validateSchema } from "@/components/schema-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  useAdminTasks,
  useCancelTask,
  useCreateTask,
  useCreateTaskTemplate,
  useDeleteTask,
  useExecuteTask,
  useTaskTypes,
  useUpdateTask,
  useValidateTaskParams,
} from "@/hooks/use-admin"
import type { AdminTasksQueryParams, Task, TaskPriority, TaskTypeOption } from "@/types"
import type { ExtendedJSONSchema, UISchema } from "@/types/schema"

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

const emptySchema: ExtendedJSONSchema = { properties: {} }
const emptyUiSchema: UISchema = {}

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

const buildCreateFormValues = () => ({
  name: "",
  description: "",
  cron_expression: "",
  priority: "NORMAL",
  enabled: "true",
})

type TaskValidationResult = {
  valid: boolean
  errors: string[]
}

type ValidationErrorNoticeProps = {
  errors: string[]
}

function ValidationErrorNotice({ errors }: ValidationErrorNoticeProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
      <div className="font-semibold">参数校验失败</div>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        {errors.map((error, index) => (
          <li key={`validation-error-${index}`}>{error}</li>
        ))}
      </ul>
    </div>
  )
}

type TaskCreateDialogProps = {
  open: boolean
  typeOptions: TaskTypeOption[]
  saving?: boolean
  validating?: boolean
  onOpenChange: (open: boolean) => void
  onValidate: (
    taskType: string,
    parameters: Record<string, unknown>
  ) => Promise<TaskValidationResult>
  onCreate: (task: Partial<Task>) => void
}

function TaskCreateDialog({
  open,
  typeOptions,
  saving = false,
  validating = false,
  onOpenChange,
  onValidate,
  onCreate,
}: TaskCreateDialogProps) {
  const createTemplateMutation = useCreateTaskTemplate()
  const [formValues, setFormValues] = useState(() => buildCreateFormValues())
  const [selectedType, setSelectedType] = useState("")
  const [parameters, setParameters] = useState<Record<string, unknown>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [templateError, setTemplateError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    setFormValues(buildCreateFormValues())
    setParameters({})
    setValidationErrors([])
    setTemplateError(null)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    if (!typeOptions.length) {
      setSelectedType("")
      return
    }
    setSelectedType((prev) =>
      typeOptions.some((option) => option.value === prev)
        ? prev
        : typeOptions[0].value
    )
  }, [open, typeOptions])

  useEffect(() => {
    if (!open) {
      return
    }
    setParameters({})
    setValidationErrors([])
    setTemplateError(null)
  }, [open, selectedType])

  const selectedTypeOption =
    typeOptions.find((option) => option.value === selectedType) ??
    (selectedType
      ? {
          value: selectedType,
          label: selectedType,
          description: "",
          schema: emptySchema,
          ui_schema: emptyUiSchema,
        }
      : undefined)

  const schema = selectedTypeOption?.schema ?? emptySchema
  const uiSchema = selectedTypeOption?.ui_schema ?? emptyUiSchema
  const isTemplateLoading = createTemplateMutation.isPending
  const isWorking = saving || validating || isTemplateLoading

  const handleParametersChange = (nextValue: Record<string, unknown>) => {
    setParameters(nextValue)
    if (validationErrors.length) {
      setValidationErrors([])
    }
  }

  const handleCreateFromTemplate = async () => {
    if (!selectedType) {
      setTemplateError("请选择任务类型")
      return
    }
    setTemplateError(null)
    try {
      const response = await createTemplateMutation.mutateAsync({
        type: selectedType,
      })
      const payload =
        response?.data && typeof response.data === "object"
          ? (response.data as Record<string, unknown>)
          : {}
      const template =
        payload.task && typeof payload.task === "object" && payload.task !== null
          ? (payload.task as Record<string, unknown>)
          : payload
      const baseValues = buildCreateFormValues()
      const nextPriority =
        typeof template.priority === "string" &&
        priorityOptions.includes(template.priority as TaskPriority)
          ? template.priority
          : baseValues.priority
      const nextEnabled =
        typeof template.enabled === "boolean"
          ? template.enabled
            ? "true"
            : "false"
          : template.enabled === "true" || template.enabled === "false"
            ? template.enabled
            : baseValues.enabled
      setFormValues({
        ...baseValues,
        name: typeof template.name === "string" ? template.name : baseValues.name,
        description:
          typeof template.description === "string"
            ? template.description
            : baseValues.description,
        cron_expression:
          typeof template.cron_expression === "string"
            ? template.cron_expression
            : baseValues.cron_expression,
        priority: nextPriority,
        enabled: nextEnabled,
      })
      const templateParameters =
        template.parameters && typeof template.parameters === "object"
          ? (template.parameters as Record<string, unknown>)
          : {}
      setParameters(templateParameters)
      setValidationErrors([])
    } catch (error) {
      setTemplateError("模板加载失败，请稍后重试")
    }
  }

  const handleCreate = async () => {
    if (!selectedType) {
      setValidationErrors(["请选择任务类型"])
      return
    }
    const normalized = validateSchema(schema, parameters)
    setParameters(normalized.data)
    try {
      const validationResult = await onValidate(selectedType, normalized.data)
      if (!validationResult.valid) {
        const errors =
          validationResult.errors && validationResult.errors.length > 0
            ? validationResult.errors
            : ["参数校验失败"]
        setValidationErrors(errors)
        return
      }
      setValidationErrors([])
    } catch (error) {
      setValidationErrors(["参数验证失败，请稍后重试"])
      return
    }

    const cronExpression = formValues.cron_expression.trim()
    onCreate({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      type: selectedType as Task["type"],
      priority: formValues.priority as TaskPriority,
      enabled: formValues.enabled === "true",
      cron_expression: cronExpression ? cronExpression : undefined,
      parameters: normalized.data,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建任务</DialogTitle>
          <DialogDescription>配置新任务的基本信息和参数</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>任务类型</span>
              <Select
                value={selectedType || ""}
                onValueChange={setSelectedType}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择任务类型" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.length > 0 ? (
                    typeOptions.map((option) => (
                      <SelectItem key={`create-type-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty" disabled>
                      暂无可用任务类型
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </label>
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
                    <SelectItem key={`create-priority-${option}`} value={option}>
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
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              参数配置
            </div>
          <SchemaForm
            key={selectedType || "task-create-schema"}
            schema={schema}
            uiSchema={uiSchema}
            value={parameters}
            onChange={handleParametersChange}
            liveValidate
            disabled={isWorking || !selectedType}
            className="rounded-md border border-border/60 bg-muted/10 p-4"
          />
          </div>
          {templateError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {templateError}
            </div>
          ) : null}
          <ValidationErrorNotice errors={validationErrors} />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isWorking}
          >
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateFromTemplate}
            disabled={isWorking || !selectedType}
          >
            {isTemplateLoading ? "加载模板中..." : "从模板创建"}
          </Button>
          <Button onClick={handleCreate} disabled={isWorking || !selectedType}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type TaskEditDialogProps = {
  open: boolean
  task?: Task | null
  saving?: boolean
  validating?: boolean
  typeOptions: TaskTypeOption[]
  onOpenChange: (open: boolean) => void
  onValidate: (
    taskType: string,
    parameters: Record<string, unknown>
  ) => Promise<TaskValidationResult>
  onSave: (
    task: Task,
    values: ReturnType<typeof buildFormValues>,
    parameters: Record<string, unknown>
  ) => void
}

function TaskEditDialog({
  open,
  task,
  saving = false,
  validating = false,
  typeOptions,
  onOpenChange,
  onValidate,
  onSave,
}: TaskEditDialogProps) {
  const [formValues, setFormValues] = useState(() =>
    buildFormValues(task ?? undefined)
  )
  const [parameters, setParameters] = useState<Record<string, unknown>>(() => {
    if (task?.parameters && typeof task.parameters === "object") {
      return task.parameters as Record<string, unknown>
    }
    return {}
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    if (!open || !task) {
      return
    }
    setFormValues(buildFormValues(task))
    setParameters(
      task.parameters && typeof task.parameters === "object"
        ? (task.parameters as Record<string, unknown>)
        : {}
    )
    setValidationErrors([])
  }, [open, task])

  if (!task) {
    return null
  }

  const selectedTypeOption =
    typeOptions.find((option) => option.value === task.type) ?? {
      value: task.type,
      label: task.type,
      description: "",
      schema: emptySchema,
      ui_schema: emptyUiSchema,
    }

  const schema = selectedTypeOption.schema ?? emptySchema
  const uiSchema = selectedTypeOption.ui_schema ?? emptyUiSchema
  const isWorking = saving || validating

  const handleParametersChange = (nextValue: Record<string, unknown>) => {
    setParameters(nextValue)
    if (validationErrors.length) {
      setValidationErrors([])
    }
  }

  const handleSave = async () => {
    const normalized = validateSchema(schema, parameters)
    setParameters(normalized.data)
    try {
      const validationResult = await onValidate(task.type, normalized.data)
      if (!validationResult.valid) {
        const errors =
          validationResult.errors && validationResult.errors.length > 0
            ? validationResult.errors
            : ["参数校验失败"]
        setValidationErrors(errors)
        return
      }
      setValidationErrors([])
    } catch (error) {
      setValidationErrors(["参数验证失败，请稍后重试"])
      return
    }

    onSave(task, formValues, normalized.data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
          <DialogDescription>修改任务配置和参数设置</DialogDescription>
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
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              参数配置
            </div>
            <SchemaForm
              key={`task-edit-${task.id}`}
              schema={schema}
              uiSchema={uiSchema}
              value={parameters}
              onChange={handleParametersChange}
              liveValidate
              disabled={isWorking}
              className="rounded-md border border-border/60 bg-muted/10 p-4"
            />
          </div>
          <ValidationErrorNotice errors={validationErrors} />
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
            disabled={isWorking}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={isWorking}>
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
  const [createOpen, setCreateOpen] = useState(false)
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
        (type): type is Task["type"] =>
          Boolean(type) && !apiTypeValues.has(type)
      )
    const extraTypes: TaskTypeOption[] = Array.from(new Set(taskTypes)).map((type) => ({
      value: type,
      label: type,
      description: "",
      schema: emptySchema,
      ui_schema: emptyUiSchema,
    }))
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

  const handleSave = (
    task: Task,
    values: ReturnType<typeof buildFormValues>,
    parameters: Record<string, unknown>
  ) => {
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
          parameters,
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

      <TaskCreateDialog
        open={createOpen}
        typeOptions={typeOptions}
        saving={createMutation.isPending}
        validating={validateMutation.isPending}
        onOpenChange={setCreateOpen}
        onValidate={validateTaskParams}
        onCreate={handleCreate}
      />
      <TaskEditDialog
        open={editOpen}
        task={editingTask}
        saving={updateMutation.isPending}
        validating={validateMutation.isPending}
        typeOptions={typeOptions}
        onOpenChange={handleEditOpenChange}
        onValidate={validateTaskParams}
        onSave={handleSave}
      />
    </div>
  )
}
