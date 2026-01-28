import * as React from "react"

import { cn } from "@/lib/utils"
import type {
  ExtendedJSONSchema,
  GroupConfig,
  SchemaFormProps,
  UISchema,
} from "@/types/schema"

import { SchemaFormProvider } from "./SchemaFormContext"
import SchemaFormField from "./SchemaFormField"
import GroupTemplate from "./templates/GroupTemplate"
import { validateSchema } from "./validators/ajv-instance"

type FieldEntry = {
  name: string
  schema: ExtendedJSONSchema
  uiSchema?: UISchema
  index: number
}

const isEqualValue = (
  left: Record<string, unknown>,
  right: Record<string, unknown>
) => JSON.stringify(left) === JSON.stringify(right)

const isNumericSegment = (segment: string) => /^\d+$/.test(segment)

const setValueAtPath = (
  value: Record<string, unknown>,
  path: string,
  fieldValue: unknown
) => {
  if (typeof path !== "string" || !path) {
    return value
  }
  const segments = path.split(".").filter(Boolean)
  if (!segments.length) {
    return value
  }
  const nextValue = { ...value } as Record<string, unknown>
  let cursor: Record<string, unknown> | unknown[] = nextValue
  segments.forEach((segment, index) => {
    const key = isNumericSegment(segment) ? Number(segment) : segment
    if (index === segments.length - 1) {
      ;(cursor as Record<string, unknown>)[key] = fieldValue
      return
    }
    const nextSegment = segments[index + 1]
    const shouldBeArray = isNumericSegment(nextSegment)
    const existing = (cursor as Record<string, unknown>)[key]
    let nextContainer: Record<string, unknown> | unknown[]
    if (Array.isArray(existing)) {
      nextContainer = [...existing]
    } else if (existing && typeof existing === "object") {
      nextContainer = { ...(existing as Record<string, unknown>) }
    } else {
      nextContainer = shouldBeArray ? [] : {}
    }
    ;(cursor as Record<string, unknown>)[key] = nextContainer
    cursor = nextContainer
  })
  return nextValue
}

const getFieldEntries = (schema: ExtendedJSONSchema, uiSchema?: UISchema) => {
  const properties = schema?.properties ?? {}
  return Object.entries(properties)
    .map(([name, definition], index) => {
      if (!definition || typeof definition !== "object") {
        return null
      }
      const fieldSchema = definition as ExtendedJSONSchema
      const fieldUiSchema =
        typeof uiSchema?.[name] === "object"
          ? (uiSchema?.[name] as UISchema)
          : undefined
      const fieldEntry: FieldEntry = {
        name,
        schema: fieldSchema,
        index,
        ...(fieldUiSchema ? { uiSchema: fieldUiSchema } : {}),
      }
      return fieldEntry
    })
    .filter((field): field is FieldEntry => field !== null)
    .sort((a, b) => {
      const orderA = a?.schema?.["x-order"] ?? Number.MAX_SAFE_INTEGER
      const orderB = b?.schema?.["x-order"] ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return (a?.index ?? 0) - (b?.index ?? 0)
    })
}

export default function SchemaForm({
  schema,
  uiSchema,
  value,
  onChange,
  onSubmit,
  liveValidate = false,
  disabled = false,
  className,
  nested = false,
}: SchemaFormProps) {
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const fields = React.useMemo(
    () => getFieldEntries(schema, uiSchema),
    [schema, uiSchema]
  )

  const groups = React.useMemo(() => {
    const groupConfigs =
      schema["x-groups"] && typeof schema["x-groups"] === "object"
        ? (schema["x-groups"] as Record<string, GroupConfig>)
        : {}
    const groupMap = new Map<
      string,
      { config: GroupConfig; fields: FieldEntry[]; index: number }
    >()
    const ungrouped: FieldEntry[] = []
    fields.forEach((field, index) => {
      const groupKey = field?.schema?.["x-group"]
      if (!groupKey) {
        ungrouped.push(field)
        return
      }
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          config: groupConfigs[groupKey] ?? { title: groupKey },
          fields: [],
          index,
        })
      }
      groupMap.get(groupKey)?.fields.push(field)
    })
    const grouped = Array.from(groupMap.entries())
      .map(([key, group]) => ({
        key,
        ...group,
      }))
      .sort((a, b) => {
        const orderA = a.config.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.config.order ?? Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return a.index - b.index
      })
    return { grouped, ungrouped }
  }, [fields, schema])

  const setFieldValue = React.useCallback(
    (path: string, fieldValue: unknown) => {
      onChange(setValueAtPath(value, path, fieldValue))
    },
    [onChange, value]
  )

  const setFieldTouched = React.useCallback(
    (path: string, isTouched: boolean) => {
      setTouched((prev) => {
        if (prev[path] === isTouched) {
          return prev
        }
        return { ...prev, [path]: isTouched }
      })
    },
    []
  )

  const getFieldError = React.useCallback(
    (name: string) => {
      if (!touched[name]) {
        return undefined
      }
      return errors[name]
    },
    [errors, touched]
  )

  const runValidation = React.useCallback(
    (nextValue: Record<string, unknown>) => {
      const result = validateSchema(schema, nextValue)
      setErrors(result.errors)
      if (!isEqualValue(nextValue, result.data)) {
        onChange(result.data)
      }
      return result
    },
    [schema, onChange]
  )

  // 当 schema 变化时重置内部状态，避免依赖 key 强制重建组件
  const schemaRef = React.useRef(schema)
  React.useEffect(() => {
    if (schemaRef.current !== schema) {
      schemaRef.current = schema
      setErrors({})
      setTouched({})
    }
  }, [schema])

  React.useEffect(() => {
    if (!liveValidate) {
      return undefined
    }
    const timeout = window.setTimeout(() => {
      runValidation(value)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [liveValidate, runValidation, value])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        if (field?.name) {
          next[field.name] = true
        }
      })
      return next
    })
    const result = runValidation(value)
    if (result.valid) {
      onSubmit?.(result.data)
    }
  }

  const formContent = (
    <>
      {groups.grouped.map((group) => (
        <GroupTemplate
          key={group.key}
          groupId={group.key}
          config={group.config}
          fields={group.fields}
          disabled={disabled}
        />
      ))}
      {groups.ungrouped.map((field) => (
        <SchemaFormField
          key={field.name}
          name={field.name}
          schema={field.schema}
          uiSchema={field.uiSchema}
          disabled={disabled}
        />
      ))}
    </>
  )

  return (
    <SchemaFormProvider
      schema={schema}
      uiSchema={uiSchema}
      value={value}
      onChange={onChange}
      errors={errors}
      touched={touched}
      setFieldValue={setFieldValue}
      setFieldTouched={setFieldTouched}
      getFieldError={getFieldError}
    >
      {nested ? (
        <div className={cn("space-y-4", className)}>{formContent}</div>
      ) : (
        <form
          className={cn("space-y-4", className)}
          onSubmit={handleSubmit}
          noValidate
        >
          {formContent}
        </form>
      )}
    </SchemaFormProvider>
  )
}
