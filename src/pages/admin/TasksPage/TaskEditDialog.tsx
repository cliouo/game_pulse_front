import { useMemo } from "react"

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
import type { Task, TaskTypeOption } from "@/types"

import { formDataToTask, type TaskValidationResult } from "./schema"
import { TaskFormFields, ValidationErrorNotice } from "./TaskFormFields"
import { useTaskForm } from "./hooks/useTaskForm"
import { emptySchema, getTaskTypeOption } from "./utils"

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
  onSave: (task: Task, values: Partial<Task>) => void
}

export default function TaskEditDialog({
  open,
  task,
  saving = false,
  validating = false,
  typeOptions,
  onOpenChange,
  onValidate,
  onSave,
}: TaskEditDialogProps) {
  const form = useTaskForm({ mode: "edit", open, task })

  const taskType = form.watch("type")
  const selectedTypeOption = useMemo(
    () => getTaskTypeOption(typeOptions, taskType),
    [taskType, typeOptions]
  )
  const schema = selectedTypeOption?.schema ?? emptySchema
  const isWorking = saving || validating
  const parameterError = form.formState.errors.parameters?.message as string | undefined
  const validationErrors =
    typeof parameterError === "string" && parameterError.length > 0
      ? parameterError.split("\n")
      : []

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!task) return

    const normalized = validateSchema(schema, data.parameters ?? {})
    form.setValue("parameters", normalized.data, { shouldDirty: true })

    try {
      const validationResult = await onValidate(task.type, normalized.data)
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

    onSave(
      task,
      formDataToTask({
        ...data,
        parameters: normalized.data,
      })
    )
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.clearErrors()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
          <DialogDescription>修改任务配置和参数设置</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <TaskFormFields
            form={form}
            typeOptions={typeOptions}
            mode="edit"
            disabled={isWorking}
          />
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
            <Button type="submit" disabled={isWorking}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
