import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { FieldProps } from "@/types/schema"

import SelectField from "./SelectField"

type NumberFieldProps = FieldProps & {
  className?: string
}

const toNumber = (value: string, isInteger: boolean) => {
  if (value.trim() === "") {
    return undefined
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return undefined
  }
  if (isInteger) {
    return Math.trunc(numeric)
  }
  return numeric
}

export default function NumberField({
  name,
  schema,
  uiSchema,
  value,
  onChange,
  disabled,
  className,
}: NumberFieldProps) {
  const widget = (uiSchema?.["ui:widget"] ?? schema["x-widget"]) as
    | string
    | undefined
  const isInteger = schema.type === "integer"
  const min = typeof schema.minimum === "number" ? schema.minimum : undefined
  const max = typeof schema.maximum === "number" ? schema.maximum : undefined
  const step = schema["x-step"] ?? schema.multipleOf ?? (isInteger ? 1 : "any")
  const displayValue =
    typeof value === "number" ? String(value) : value == null ? "" : String(value)

  if (widget === "slider") {
    const resolvedValue =
      typeof value === "number"
        ? value
        : typeof schema.default === "number"
          ? schema.default
          : typeof min === "number"
            ? min
            : 0
    return (
      <Slider
        value={[resolvedValue]}
        min={min}
        max={max}
        step={typeof step === "number" ? step : undefined}
        onValueChange={(nextValue) => onChange(nextValue[0])}
        disabled={disabled}
        className={className}
      />
    )
  }

  const hasEnum = Array.isArray(schema.enum) && schema.enum.length > 0
  if (widget === "select" || hasEnum) {
    if (!hasEnum) {
      return (
        <Input
          type="number"
          value={displayValue}
          onChange={(event) =>
            onChange(toNumber(event.target.value, Boolean(isInteger)))
          }
          placeholder={schema["x-placeholder"]}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={className}
        />
      )
    }
    return (
      <SelectField
        name={name}
        schema={schema}
        uiSchema={uiSchema}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
    )
  }

  return (
    <Input
      type="number"
      value={displayValue}
      onChange={(event) =>
        onChange(toNumber(event.target.value, Boolean(isInteger)))
      }
      placeholder={schema["x-placeholder"]}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={className}
    />
  )
}
