import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { SchemaForm } from "@/components/schema-form"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import type { TaskTypeOption } from "@/types"

import { priorityOptions, type TaskFormData } from "./schema"
import { emptySchema, emptyUiSchema, getTaskTypeOption } from "./utils"

const FieldError = ({ message }: { message?: string }) => {
  if (!message) {
    return null
  }
  return <span className="text-xs text-destructive">{message}</span>
}

type ValidationErrorNoticeProps = {
  errors: string[]
}

export function ValidationErrorNotice({ errors }: ValidationErrorNoticeProps) {
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

type TaskFormFieldsProps = {
  form: UseFormReturn<TaskFormData>
  typeOptions: TaskTypeOption[]
  mode: "create" | "edit"
  disabled?: boolean
  onTypeChange?: () => void
}

export function TaskFormFields({
  form,
  typeOptions,
  mode,
  disabled = false,
  onTypeChange,
}: TaskFormFieldsProps) {
  const selectedType = useWatch({ control: form.control, name: "type" })
  const selectedTypeOption = getTaskTypeOption(typeOptions, selectedType)
  const schema = selectedTypeOption?.schema ?? emptySchema
  const uiSchema = selectedTypeOption?.ui_schema ?? emptyUiSchema
  const parametersDisabled = disabled || (mode === "create" && !selectedType)

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "create" ? (
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
                <span>任务类型</span>
                <NativeSelect
                  value={field.value || ""}
                  onChange={(value) => {
                    field.onChange(value)
                    onTypeChange?.()
                  }}
                  disabled={disabled}
                  placeholder="选择任务类型"
                  options={typeOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
        ) : null}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>任务名称</span>
              <Input
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                disabled={disabled}
              />
              <FieldError message={fieldState.error?.message} />
            </label>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>任务描述</span>
              <Input
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                disabled={disabled}
              />
              <FieldError message={fieldState.error?.message} />
            </label>
          )}
        />
        <Controller
          name="cron_expression"
          control={form.control}
          render={({ field, fieldState }) => (
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              <span>Cron 表达式</span>
              <Input
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                disabled={disabled}
              />
              <FieldError message={fieldState.error?.message} />
            </label>
          )}
        />
        <Controller
          name="priority"
          control={form.control}
          render={({ field, fieldState }) => (
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>优先级</span>
              <NativeSelect
                value={field.value}
                onChange={(value) => field.onChange(value)}
                disabled={disabled}
                options={priorityOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
              <FieldError message={fieldState.error?.message} />
            </label>
          )}
        />
        <Controller
          name="enabled"
          control={form.control}
          render={({ field, fieldState }) => (
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>启用状态</span>
              <NativeSelect
                value={field.value ? "true" : "false"}
                onChange={(value) => field.onChange(value === "true")}
                disabled={disabled}
                options={[
                  { value: "true", label: "启用" },
                  { value: "false", label: "停用" },
                ]}
              />
              <FieldError message={fieldState.error?.message} />
            </label>
          )}
        />
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">参数配置</div>
        <Controller
          name="parameters"
          control={form.control}
          render={({ field }) => (
            <SchemaForm
              schema={schema}
              uiSchema={uiSchema}
              value={(field.value ?? {}) as Record<string, unknown>}
              onChange={(nextValue) => {
                field.onChange(nextValue)
                form.clearErrors("parameters")
              }}
              liveValidate
              disabled={parametersDisabled}
              nested
              className="rounded-md border border-border/60 bg-muted/10 p-4"
            />
          )}
        />
      </div>
      {mode === "edit" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Controller
            name="timeout"
            control={form.control}
            render={({ field, fieldState }) => (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>超时 (秒)</span>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    if (nextValue === "") {
                      field.onChange(undefined)
                      return
                    }
                    const parsed = Number(nextValue)
                    field.onChange(Number.isFinite(parsed) ? parsed : undefined)
                  }}
                  disabled={disabled}
                />
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
          <Controller
            name="max_retries"
            control={form.control}
            render={({ field, fieldState }) => (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>最大重试</span>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    if (nextValue === "") {
                      field.onChange(undefined)
                      return
                    }
                    const parsed = Number(nextValue)
                    field.onChange(Number.isFinite(parsed) ? parsed : undefined)
                  }}
                  disabled={disabled}
                />
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
          <Controller
            name="retry_interval"
            control={form.control}
            render={({ field, fieldState }) => (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>重试间隔 (秒)</span>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    if (nextValue === "") {
                      field.onChange(undefined)
                      return
                    }
                    const parsed = Number(nextValue)
                    field.onChange(Number.isFinite(parsed) ? parsed : undefined)
                  }}
                  disabled={disabled}
                />
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
          <Controller
            name="concurrency"
            control={form.control}
            render={({ field, fieldState }) => (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>并发数</span>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    if (nextValue === "") {
                      field.onChange(undefined)
                      return
                    }
                    const parsed = Number(nextValue)
                    field.onChange(Number.isFinite(parsed) ? parsed : undefined)
                  }}
                  disabled={disabled}
                />
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
          <Controller
            name="single_run"
            control={form.control}
            render={({ field, fieldState }) => (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>单次执行</span>
                <NativeSelect
                  value={field.value ? "true" : "false"}
                  onChange={(value) => field.onChange(value === "true")}
                  disabled={disabled}
                  options={[
                    { value: "true", label: "是" },
                    { value: "false", label: "否" },
                  ]}
                />
                <FieldError message={fieldState.error?.message} />
              </label>
            )}
          />
        </div>
      ) : null}
    </div>
  )
}
