import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { FieldProps } from "@/types/schema"

type BooleanFieldProps = FieldProps & {
  className?: string
}

export default function BooleanField({
  schema,
  uiSchema,
  value,
  onChange,
  disabled,
  className,
}: BooleanFieldProps) {
  const widget = (uiSchema?.["ui:widget"] ?? schema["x-widget"]) as
    | string
    | undefined
  const checked = Boolean(value)

  if (widget === "switch") {
    return (
      <Switch
        checked={checked}
        onCheckedChange={(nextValue) => onChange(nextValue)}
        disabled={disabled}
        className={className}
      />
    )
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Checkbox
        checked={checked}
        onCheckedChange={(nextValue) => onChange(nextValue === true)}
        disabled={disabled}
      />
    </div>
  )
}
