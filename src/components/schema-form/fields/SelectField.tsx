import { NativeSelect } from "@/components/ui/native-select"
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
  const enumValues = Array.isArray(schema?.enum) ? schema.enum : []
  if (!enumValues.length) {
    return null
  }
  const labels = schema?.["x-enumLabels"] ?? []
  const options = enumValues.map((option: unknown, index: number) => ({
    value: String(option),
    label: String(labels[index] ?? option),
  }))
  const isNumberType =
    schema?.type === "number" ||
    schema?.type === "integer" ||
    enumValues.every((option: unknown) => typeof option === "number")
  const selectValue =
    value === undefined || value === null ? "" : String(value)
  const placeholder = schema?.["x-placeholder"] ?? "请选择"

  const handleChange = (nextValue: string) => {
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
    <NativeSelect
      value={selectValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      options={options}
      className={className}
    />
  )
}
