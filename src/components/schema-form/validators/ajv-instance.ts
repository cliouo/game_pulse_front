import Ajv, { type ErrorObject } from "ajv"
import addFormats from "ajv-formats"

import type { ExtendedJSONSchema } from "@/types/schema"

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  useDefaults: true,
  strict: false,
})

addFormats(ajv)

const cloneValue = (value: Record<string, unknown>) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
}

const getErrorKey = (error: ErrorObject) => {
  if (
    error.keyword === "required" &&
    typeof (error.params as { missingProperty?: string }).missingProperty ===
      "string"
  ) {
    return (error.params as { missingProperty: string }).missingProperty
  }
  const rawPath = error.instancePath
  if (typeof rawPath !== "string" || !rawPath) {
    return undefined
  }
  const path = rawPath.replace(/^\//, "")
  if (!path) {
    return undefined
  }
  return path.split("/")[0]
}

const formatErrors = (errors?: ErrorObject[] | null) => {
  const errorMap: Record<string, string[]> = {}
  if (!errors) {
    return errorMap
  }
  errors.forEach((error) => {
    const key = getErrorKey(error)
    if (!key) {
      return
    }
    const message = error.message ?? "Invalid value"
    if (!errorMap[key]) {
      errorMap[key] = []
    }
    errorMap[key].push(message)
  })
  return errorMap
}

export const validateSchema = (
  schema: ExtendedJSONSchema,
  value: Record<string, unknown>
) => {
  const data = cloneValue(value)
  const validate = ajv.compile(schema)
  const valid = validate(data)
  return {
    valid: Boolean(valid),
    errors: formatErrors(validate.errors),
    data,
  }
}
