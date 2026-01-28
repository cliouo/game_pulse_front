import type { TaskTypeOption } from "@/types"
import type { ExtendedJSONSchema, UISchema } from "@/types/schema"

export const emptySchema: ExtendedJSONSchema = { properties: {} }
export const emptyUiSchema: UISchema = {}

export function getTaskTypeOption(
  typeOptions: TaskTypeOption[],
  type?: string
) {
  if (!type) {
    return undefined
  }

  return (
    typeOptions.find((option) => option.value === type) ?? {
      value: type,
      label: type,
      description: "",
      schema: emptySchema,
      ui_schema: emptyUiSchema,
    }
  )
}
