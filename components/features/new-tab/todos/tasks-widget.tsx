"use client"

import type {
  DailyTaskWithCompletion,
  GeneralTodo,
  TaskItemType,
} from "@/types/new-tab"
import { useMemo } from "react"
import { TasksList } from "./tasks-list"

type TasksWidgetProps = {
  initialDailyTasks: DailyTaskWithCompletion[]
  initialGeneralTodos: GeneralTodo[]
}

export function TasksWidget({
  initialDailyTasks,
  initialGeneralTodos,
}: TasksWidgetProps) {
  const dailyTaskItems: TaskItemType[] = useMemo(
    () =>
      initialDailyTasks.map((t) => ({
        ...t,
        is_completed: t.is_completed_today,
      })),
    [initialDailyTasks]
  )

  const generalTodoItems: TaskItemType[] = useMemo(
    () =>
      initialGeneralTodos.map((t) => ({
        ...t,
        is_completed: t.is_completed,
      })),
    [initialGeneralTodos]
  )

  const hasDaily = initialDailyTasks.length > 0
  const hasGeneral = initialGeneralTodos.length > 0

  return (
    <div className="flex h-fit max-h-[500px] w-full flex-col overflow-hidden rounded-lg bg-secondary/50 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-4 overflow-y-auto">
        <TasksList
          title="Daily Tasks"
          taskType="daily"
          initialItems={dailyTaskItems}
        />

        {hasDaily && hasGeneral && <hr className="border-t border-white/20" />}

        <TasksList
          title="General Todos"
          taskType="general"
          initialItems={generalTodoItems}
        />
      </div>
    </div>
  )
}
