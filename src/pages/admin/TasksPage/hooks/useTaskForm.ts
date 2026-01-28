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
    console.log(`[useTaskForm] effect triggered, mode=${mode}, open=${open}`)
    if (mode === "create") {
      if (!open) {
        // 延迟 reset，确保 Dialog 关闭动画完成后再执行
        // 避免在 Portal 移除过程中触发状态变化导致 DOM 不同步
        console.log(`[useTaskForm] create mode, dialog closed, scheduling delayed form.reset()`)
        const timer = setTimeout(() => {
          console.log(`[useTaskForm] executing delayed form.reset()`)
          form.reset(taskToFormData())
        }, 200)
        return () => clearTimeout(timer)
      }
      return
    }

    if (task && open) {
      console.log(`[useTaskForm] edit mode, dialog opened with task, calling form.reset()`)
      form.reset(taskToFormData(task))
    }
  }, [form, mode, open, task])

  return form
}
