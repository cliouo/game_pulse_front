import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import type { Task } from "@/types"

import { taskFormSchema, taskToFormData, type TaskFormData } from "../schema"

const createTaskSchema = taskFormSchema.pick({
  name: true,
  description: true,
  type: true,
  cron_expression: true,
  priority: true,
  enabled: true,
  parameters: true,
})

type UseTaskFormOptions = {
  mode: "create" | "edit"
  open: boolean
  task?: Task | null
}

export function useTaskForm({ mode, open, task }: UseTaskFormOptions) {
  const resolverSchema = useMemo(
    () => (mode === "create" ? createTaskSchema : taskFormSchema),
    [mode]
  )
  const defaultValues = useMemo(
    () => taskToFormData(mode === "edit" ? task ?? undefined : undefined),
    [mode, task]
  )

  const form = useForm<TaskFormData>({
    resolver: zodResolver(resolverSchema),
    defaultValues,
  })

  useEffect(() => {
    if (mode === "create") {
      if (!open) {
        form.reset(taskToFormData())
      }
      return
    }

    if (task && open) {
      form.reset(taskToFormData(task))
    }
  }, [form, mode, open, task])

  return form
}
