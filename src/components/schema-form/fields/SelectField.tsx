import { useEffect, useRef } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { FieldProps } from "@/types/schema"

type SelectFieldProps = FieldProps & {
  className?: string
}

export default function SelectField({
  schema,
  value,
  onChange,
  disabled,
  className,
}: SelectFieldProps) {
  const instanceId = useRef(Math.random().toString(36).slice(2, 8))

  useEffect(() => {
    console.log(`[SelectField ${instanceId.current}] MOUNTED`)
    return () => {
      console.log(`[SelectField ${instanceId.current}] UNMOUNTING`)
    }
  }, [])

  const enumValues = Array.isArray(schema?.enum) ? schema.enum : []
  if (!enumValues.length) {
    return null
  }
  const labels = schema?.["x-enumLabels"] ?? []
  const options = enumValues.map((option: unknown, index: number) => ({
    value: String(option),
    label: labels[index] ?? String(option),
    raw: option,
  }))
  const isNumberType =
    schema?.type === "number" ||
    schema?.type === "integer" ||
    enumValues.every((option: unknown) => typeof option === "number")
  const selectValue =
    value === undefined || value === null ? undefined : String(value)
  const placeholder = schema?.["x-placeholder"] ?? "请选择"

  const handleValueChange = (nextValue: string) => {
    if (nextValue === "") {
      onChange(undefined)
      return
    }
    if (isNumberType) {
      const numeric = Number(nextValue)
      onChange(Number.isNaN(numeric) ? undefined : numeric)
      return
    }
    onChange(nextValue)
  }

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: { value: string; label: string; raw: unknown }) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
