import * as React from "react"

import type { ExtendedJSONSchema, UISchema } from "@/types/schema"

import { useSchemaFormContext } from "./SchemaFormContext"
import ArrayField from "./fields/ArrayField"
import BooleanField from "./fields/BooleanField"
import NumberField from "./fields/NumberField"
import ObjectField from "./fields/ObjectField"
import StringField from "./fields/StringField"
import FieldTemplate from "./templates/FieldTemplate"
import { evaluateDependsOn, getValueAtPath } from "./utils/dependency-resolver"

type SchemaFormFieldProps = {
  name: string
  schema: ExtendedJSONSchema
  uiSchema?: UISchema
  disabled?: boolean
  className?: string
  path?: string
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

export default function SchemaFormField({
  name,
  schema,
  uiSchema,
  disabled,
  className,
  path,
}: SchemaFormFieldProps) {
  const instanceId = React.useRef(Math.random().toString(36).slice(2, 8))
  const {
    value: formValue,
    uiSchema: formUiSchema,
    setFieldValue,
    setFieldTouched,
    getFieldError,
  } = useSchemaFormContext()

  React.useEffect(() => {
    console.log(`[SchemaFormField ${instanceId.current}] MOUNTED name=${name}`)
    return () => {
      console.log(`[SchemaFormField ${instanceId.current}] UNMOUNTING name=${name}`)
    }
  }, [name])

  const fieldUiSchema =
    uiSchema ?? (path ? undefined : (formUiSchema?.[name] as UISchema | undefined))
  const safeName = typeof name === "string" ? name : String(name)
  const safePath = typeof path === "string" ? path : undefined
  const fieldPath = safePath ? `${safePath}.${safeName}` : safeName
  const fieldValue = getValueAtPath(formValue, fieldPath)
  const isDisabled = Boolean(disabled || schema["x-disabled"])
  const errors = path ? undefined : getFieldError(name)

  if (schema["x-hidden"]) {
    console.log(`[SchemaFormField ${instanceId.current}] hidden, returning null for name=${name}`)
    return null
  }
  if (!evaluateDependsOn(schema["x-dependsOn"], formValue)) {
    console.log(`[SchemaFormField ${instanceId.current}] dependsOn not met, returning null for name=${name}`)
    return null
  }

  const handleChange = (nextValue: unknown) => {
    setFieldValue(fieldPath, nextValue)
    setFieldTouched(fieldPath, true)
  }

  const type = resolveType(schema)
  let FieldComponent = StringField
  if (type === "number" || type === "integer") {
    FieldComponent = NumberField
  } else if (type === "boolean") {
    FieldComponent = BooleanField
  } else if (type === "object") {
    FieldComponent = ObjectField
  } else if (type === "array") {
    FieldComponent = ArrayField
  }

  const fieldElement = (
    <FieldComponent
      name={name}
      schema={schema}
      uiSchema={fieldUiSchema}
      value={fieldValue}
      onChange={handleChange}
      errors={errors}
      disabled={isDisabled}
      className={className}
      path={fieldPath}
    />
  )

  if (type === "object" || type === "array") {
    return fieldElement
  }

  return (
    <FieldTemplate
      name={name}
      schema={schema}
      errors={errors}
      disabled={isDisabled}
      className={className}
    >
      {fieldElement}
    </FieldTemplate>
  )
}
