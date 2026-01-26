/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import type { ExtendedJSONSchema, UISchema } from "@/types/schema"

export type SchemaFormErrors = Record<string, string[]>
export type SchemaFormTouched = Record<string, boolean>

export type SchemaFormContextValue = {
  schema: ExtendedJSONSchema
  uiSchema?: UISchema
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  errors: SchemaFormErrors
  touched: SchemaFormTouched
  setFieldValue: (path: string, value: unknown) => void
  setFieldTouched: (path: string, touched: boolean) => void
  getFieldError: (name: string) => string[] | undefined
}

const SchemaFormContext = React.createContext<SchemaFormContextValue | null>(null)

type SchemaFormProviderProps = SchemaFormContextValue & {
  children: React.ReactNode
}

export function SchemaFormProvider({
  children,
  ...value
}: SchemaFormProviderProps) {
  return (
    <SchemaFormContext.Provider value={value}>
      {children}
    </SchemaFormContext.Provider>
  )
}

export function useSchemaFormContext() {
  const context = React.useContext(SchemaFormContext)
  if (!context) {
    throw new Error("useSchemaFormContext must be used within SchemaFormProvider")
  }
  return context
}
