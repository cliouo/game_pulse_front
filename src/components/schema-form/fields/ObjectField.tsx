import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ExtendedJSONSchema, FieldProps, UISchema } from "@/types/schema"

import SchemaFormField from "../SchemaFormField"

type ObjectFieldProps = FieldProps & {
  path?: string
  className?: string
}

type FieldEntry = {
  name: string
  schema: ExtendedJSONSchema
  uiSchema?: UISchema
  index: number
}

const getFieldEntries = (schema: ExtendedJSONSchema, uiSchema?: UISchema) => {
  const properties = schema.properties ?? {}
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
      return {
        name,
        schema: fieldSchema,
        uiSchema: fieldUiSchema,
        index,
      }
    })
    .filter((field): field is FieldEntry => Boolean(field))
    .sort((a, b) => {
      const orderA = a.schema["x-order"] ?? Number.MAX_SAFE_INTEGER
      const orderB = b.schema["x-order"] ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return a.index - b.index
    })
}

export default function ObjectField({
  name,
  schema,
  uiSchema,
  errors,
  disabled,
  className,
  path,
}: ObjectFieldProps) {
  const [collapsed, setCollapsed] = React.useState(
    Boolean(schema["x-collapsed"])
  )
  const fields = React.useMemo(
    () => getFieldEntries(schema, uiSchema),
    [schema, uiSchema]
  )
  const title = schema.title ?? name
  const helpText = schema["x-help"] ?? schema.description
  const isDisabled = Boolean(disabled || schema["x-disabled"])
  const showErrors = errors && errors.length > 0
  const isCollapsible = typeof schema["x-collapsed"] === "boolean"
  const contentId = React.useId()
  const contentWrapperClass = cn(
    "grid transition-all duration-200",
    isCollapsible && (collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]")
  )

  return (
    <div className={cn(isDisabled && "opacity-70", className)} aria-disabled={isDisabled}>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {helpText ? <CardDescription>{helpText}</CardDescription> : null}
          </div>
          {isCollapsible ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-expanded={!collapsed}
              aria-controls={contentId}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "-rotate-90"
                )}
              />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div id={contentId} className={contentWrapperClass}>
            <div className="overflow-hidden">
              <div className="space-y-4">
                {fields.map((field) => (
                  <SchemaFormField
                    key={field.name}
                    name={field.name}
                    schema={field.schema}
                    uiSchema={field.uiSchema}
                    disabled={isDisabled}
                    path={path ?? name}
                  />
                ))}
                {showErrors ? (
                  <ul className="space-y-1 text-xs text-destructive">
                    {errors.map((error, index) => (
                      <li key={`${name}-error-${index}`}>{error}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
