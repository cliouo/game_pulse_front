import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { FieldProps } from "@/types/schema"

import SelectField from "./SelectField"

type StringFieldProps = FieldProps & {
  className?: string
}

export default function StringField({
  name,
  schema,
  uiSchema,
  value,
  onChange,
  disabled,
  className,
}: StringFieldProps) {
  const widget = (uiSchema?.["ui:widget"] ?? schema?.["x-widget"]) as
    | string
    | undefined
  const placeholder = schema?.["x-placeholder"]
  const displayValue =
    typeof value === "string" ? value : value == null ? "" : String(value)

  if (widget === "textarea") {
    return (
      <Textarea
        value={displayValue}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    )
  }

  if (widget === "combobox") {
    const enumValues = Array.isArray(schema?.enum) ? schema.enum : []
    const labels = schema?.["x-enumLabels"] ?? []
    const listId = `schema-form-${name}-list`
    return (
      <>
        <Input
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          list={enumValues.length ? listId : undefined}
          className={className}
        />
        {enumValues.length ? (
          <datalist id={listId}>
            {enumValues.map((option: unknown, index: number) => (
              <option key={String(option)} value={String(option)}>
                {labels[index] ?? String(option)}
              </option>
            ))}
          </datalist>
        ) : null}
      </>
    )
  }

  const hasEnum = Array.isArray(schema?.enum) && schema.enum.length > 0
  if (widget === "select" || hasEnum) {
    if (!hasEnum) {
      return (
        <Input
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
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
      value={displayValue}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  )
}
