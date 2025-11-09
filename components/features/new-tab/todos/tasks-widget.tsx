"use client"

import { cn } from "@/lib/utils"
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
  isEditing: boolean
}

export function TasksWidget({
  initialDailyTasks,
  initialGeneralTodos,
  isEditing,
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

  const showDaily = initialDailyTasks.length > 0 || isEditing
  const showGeneral = initialGeneralTodos.length > 0 || isEditing

  return (
    <div
      className={cn(
        "flex h-fit max-h-[500px] w-64 flex-col rounded-lg bg-secondary/50 p-4 backdrop-blur-sm transition-opacity",
        !showDaily && !showGeneral ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col gap-4 overflow-y-auto">
        {showDaily && (
          <TasksList
            title="Daily Tasks"
            taskType="daily"
            initialItems={dailyTaskItems}
            isEditing={isEditing}
          />
        )}

        {showDaily && showGeneral && (
          <hr className="border-t border-white/20" />
        )}

        {showGeneral && (
          <TasksList
            title="General Todos"
            taskType="general"
            initialItems={generalTodoItems}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  )
}
