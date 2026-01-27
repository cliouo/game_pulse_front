import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ExtendedJSONSchema } from "@/types/schema"

type FieldTemplateProps = {
  name: string
  schema: ExtendedJSONSchema
  children: React.ReactNode
  errors?: string[]
  disabled?: boolean
  className?: string
}

export default function FieldTemplate({
  name,
  schema,
  children,
  errors,
  disabled,
  className,
}: FieldTemplateProps) {
  if (schema?.["x-hidden"]) {
    return null
  }

  const label = schema?.title ?? name
  const helpText = schema?.["x-help"] ?? schema?.description
  const isDisabled = Boolean(disabled || schema?.["x-disabled"])
  const showErrors = errors && errors.length > 0

  return (
    <div
      className={cn("space-y-2", isDisabled && "opacity-70", className)}
      aria-disabled={isDisabled}
    >
      {label ? <Label className="text-sm font-medium">{label}</Label> : null}
      {children}
      {helpText ? (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      ) : null}
      {showErrors ? (
        <ul className="space-y-1 text-xs text-destructive">
          {errors.map((error, index) => (
            <li key={`${name}-error-${index}`}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
