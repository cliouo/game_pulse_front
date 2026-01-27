import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ExtendedJSONSchema, FieldProps, UISchema } from "@/types/schema"

import SchemaFormField from "../SchemaFormField"

type ArrayFieldProps = FieldProps & {
  path?: string
  className?: string
}

const resolveType = (schema: ExtendedJSONSchema) => {
  if (Array.isArray(schema?.type)) {
    return schema.type[0]
  }
  if (schema?.type) {
    return schema.type
  }
  if (schema?.properties) {
    return "object"
  }
  if (schema?.items) {
    return "array"
  }
  return undefined
}

const toUniqueKey = (value: unknown) => {
  if (value === undefined) {
    return "undefined"
  }
  if (value === null) {
    return "null"
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

const hasDuplicates = (items: unknown[]) => {
  const seen = new Set<string>()
  for (const item of items) {
    const key = toUniqueKey(item)
    if (seen.has(key)) {
      return true
    }
    seen.add(key)
  }
  return false
}

const getDefaultItemValue = (schema: ExtendedJSONSchema) => {
  if (schema?.default !== undefined) {
    return schema.default
  }
  if (Array.isArray(schema?.enum) && schema.enum.length > 0) {
    return schema.enum[0]
  }
  const type = resolveType(schema)
  if (type === "object") {
    return {}
  }
  if (type === "array") {
    return []
  }
  if (type === "boolean") {
    return false
  }
  if (type === "number" || type === "integer") {
    return 0
  }
  return ""
}

export default function ArrayField({
  name,
  schema,
  uiSchema,
  value,
  onChange,
  errors,
  disabled,
  className,
  path,
}: ArrayFieldProps) {
  const items = Array.isArray(value) ? value : []
  const itemSchema =
    schema?.items && typeof schema.items === "object"
      ? (Array.isArray(schema.items)
          ? schema.items[0]
          : schema.items) as ExtendedJSONSchema
      : undefined
  const itemUiSchema =
    typeof uiSchema?.items === "object" ? (uiSchema.items as UISchema) : undefined
  const label = schema?.title ?? name
  const helpText = schema?.["x-help"] ?? schema?.description
  const isDisabled = Boolean(disabled || schema?.["x-disabled"])
  const uniqueError =
    schema?.uniqueItems && hasDuplicates(items)
      ? "Items must be unique"
      : undefined
  const errorList = [...(errors ?? [])]
  if (uniqueError) {
    errorList.push(uniqueError)
  }
  const showErrors = errorList.length > 0

  const handleAdd = () => {
    if (!itemSchema) {
      return
    }
    onChange([...items, getDefaultItemValue(itemSchema)])
  }

  const handleRemove = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div
      className={cn("space-y-2", isDisabled && "opacity-70", className)}
      aria-disabled={isDisabled}
    >
      {label ? <Label className="text-sm font-medium">{label}</Label> : null}
      <div className="space-y-3">
        {items.map((_, index) => (
          <div key={`${name}-item-${index}`} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Item {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={isDisabled}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
            {itemSchema ? (
              <SchemaFormField
                name={String(index)}
                schema={itemSchema}
                uiSchema={itemUiSchema}
                disabled={isDisabled}
                path={path ?? name}
              />
            ) : null}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={isDisabled || !itemSchema}
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>
      {helpText ? (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      ) : null}
      {showErrors ? (
        <ul className="space-y-1 text-xs text-destructive">
          {errorList.map((error, index) => (
            <li key={`${name}-error-${index}`}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
