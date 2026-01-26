import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ExtendedJSONSchema, GroupConfig, UISchema } from "@/types/schema"

import SchemaFormField from "../SchemaFormField"

export type GroupFieldEntry = {
  name: string
  schema: ExtendedJSONSchema
  uiSchema?: UISchema
}

type GroupTemplateProps = {
  groupId: string
  config: GroupConfig
  fields: GroupFieldEntry[]
  disabled?: boolean
}

const resolveColumns = (columns?: number) => {
  if (typeof columns !== "number" || columns <= 0) {
    return 1
  }
  return Math.max(1, Math.floor(columns))
}

export default function GroupTemplate({
  groupId,
  config,
  fields,
  disabled,
}: GroupTemplateProps) {
  const [collapsed, setCollapsed] = React.useState(Boolean(config.collapsed))
  const isCollapsible = Boolean(config.collapsible ?? config.collapsed)
  const title = config.title || groupId
  const columns = resolveColumns(config.columns)
  const contentId = React.useId()
  const contentWrapperClass = cn(
    "grid transition-all duration-200",
    isCollapsible && (collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]")
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{title}</CardTitle>
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
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {fields.map((field) => (
                <SchemaFormField
                  key={field.name}
                  name={field.name}
                  schema={field.schema}
                  uiSchema={field.uiSchema}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
