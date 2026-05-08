import { useEffect, useMemo, useState } from "react"

import { validateSchema } from "@/components/schema-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateTaskTemplate } from "@/hooks/use-admin"
import type { Task, TaskTypeOption } from "@/types"

import {
  formDataToTask,
  priorityOptions,
  taskToFormData,
  type TaskFormData,
  type TaskValidationResult,
} from "./schema"
import { TaskFormFields, ValidationErrorNotice } from "./TaskFormFields"
import { useTaskForm } from "./hooks/useTaskForm"
import { emptySchema, getTaskTypeOption } from "./utils"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isPriority = (value: unknown): value is TaskFormData["priority"] =>
  typeof value === "string" &&
  priorityOptions.includes(value as TaskFormData["priority"])

function parseTemplateData(response: unknown): Partial<TaskFormData> {
  if (!isRecord(response)) {
    return {}
  }

  const data = "task" in response ? response.task : response
  if (!isRecord(data)) {
    return {}
  }

  return {
    name: typeof data.name === "string" ? data.name : undefined,
    description:
      typeof data.description === "string" ? data.description : undefined,
    cron_expression:
      typeof data.cron_expression === "string" ? data.cron_expression : undefined,
    priority: isPriority(data.priority) ? data.priority : undefined,
    enabled: typeof data.enabled === "boolean" ? data.enabled : undefined,
    parameters: isRecord(data.parameters) ? data.parameters : undefined,
  }
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

export default function TaskCreateDialog({
  open,
  typeOptions,
  saving = false,
  validating = false,
  onOpenChange,
  onValidate,
  onCreate,
}: TaskCreateDialogProps) {
  const createTemplateMutation = useCreateTaskTemplate()
  const form = useTaskForm({ mode: "create", open })
  const [rootError, setRootError] = useState<string | null>(null)

  const taskType = form.watch("type")
  const selectedTypeOption = useMemo(
    () => getTaskTypeOption(typeOptions, taskType),
    [taskType, typeOptions]
  )
  const schema = selectedTypeOption?.schema ?? emptySchema
  const isTemplateLoading = createTemplateMutation.isPending
  const isWorking = saving || validating || isTemplateLoading
  const parameterError = form.formState.errors.parameters?.message as string | undefined
  const validationErrors =
    typeof parameterError === "string" && parameterError.length > 0
      ? parameterError.split("\n")
      : []
  const templateError = rootError && rootError.length > 0 ? rootError : null

  useEffect(() => {
    if (!open) {
      return
    }

    if (!typeOptions.length) {
      if (form.getValues("type")) {
        form.setValue("type", "", { shouldDirty: false })
      }
      return
    }

    const currentType = form.getValues("type")
    const nextType = typeOptions.some((option) => option.value === currentType)
      ? currentType
      : typeOptions[0].value
    if (nextType !== currentType) {
      form.setValue("type", nextType, { shouldDirty: false })
      form.setValue("parameters", {})
      form.clearErrors("parameters")
    }
  }, [form, open, typeOptions])

  const handleSubmit = form.handleSubmit(async (data) => {
    const normalized = validateSchema(schema, data.parameters ?? {})
    form.setValue("parameters", normalized.data, { shouldDirty: true })

    try {
      const validationResult = await onValidate(data.type, normalized.data)
      if (!validationResult.valid) {
        const errors =
          validationResult.errors && validationResult.errors.length > 0
            ? validationResult.errors
            : ["参数校验失败"]
        form.setError("parameters", {
          type: "validate",
          message: errors.join("\n"),
        })
        return
      }
      form.clearErrors("parameters")
    } catch {
      const errors = ["参数验证失败，请稍后重试"]
      form.setError("parameters", {
        type: "validate",
        message: errors.join("\n"),
      })
      return
    }

    onCreate(
      formDataToTask({
        ...data,
        parameters: normalized.data,
      })
    )
  })

  const handleLoadTemplate = async () => {
    const currentType = form.getValues("type")
    if (!currentType) {
      form.setError("type", { type: "validate", message: "请选择任务类型" })
      return
    }

    setRootError(null)
    try {
      const response = await createTemplateMutation.mutateAsync({
        type: currentType,
      })
      const templateData = parseTemplateData(response?.data ?? response)
      const baseValues = taskToFormData()

      form.reset({
        ...baseValues,
        ...templateData,
        type: currentType,
        parameters: templateData.parameters ?? baseValues.parameters,
      })
      form.clearErrors()
      setRootError(null)
    } catch {
      setRootError("模板加载失败，请稍后重试")
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.clearErrors()
      setRootError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleTypeChange = () => {
    form.setValue("parameters", {})
    form.clearErrors("parameters")
    setRootError(null)
  }

  // 不渲染时直接返回 null，彻底避免 Portal 卸载冲突
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建任务</DialogTitle>
          <DialogDescription>配置新任务的基本信息和参数</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <TaskFormFields
            form={form}
            typeOptions={typeOptions}
            mode="create"
            disabled={isWorking}
            onTypeChange={handleTypeChange}
          />
          {templateError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {templateError}
            </div>
          ) : null}
          <ValidationErrorNotice errors={validationErrors} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isWorking}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadTemplate}
              disabled={isWorking || !taskType}
            >
              {isTemplateLoading ? "加载模板中..." : "从模板创建"}
            </Button>
            <Button type="submit" disabled={isWorking || !taskType}>
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
