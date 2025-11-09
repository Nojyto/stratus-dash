"use client"

import {
  createDailyTask,
  createGeneralTodo,
  toggleDailyTask,
  toggleGeneralTodo,
  updateDailyTaskOrder,
  updateGeneralTodoOrder,
} from "@/app/new-tab/actions/todos"
import { SubmitButton } from "@/components/common/submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type {
  DailyTask,
  FormState,
  GeneralTodo,
  TaskItemType,
} from "@/types/new-tab"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import { TaskItem } from "./task-item"

type TasksListProps = {
  initialItems: TaskItemType[]
  taskType: "daily" | "general"
  title: string
}

export function TasksList({ initialItems, taskType, title }: TasksListProps) {
  const [items, setItems] = useState(initialItems)
  const [, startTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const createAction =
    taskType === "daily" ? createDailyTask : createGeneralTodo
  const toggleAction =
    taskType === "daily" ? toggleDailyTask : toggleGeneralTodo
  const updateOrderAction =
    taskType === "daily" ? updateDailyTaskOrder : updateGeneralTodoOrder
  const [state, formAction] = useActionState<FormState | null, FormData>(
    createAction,
    null
  )

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  useEffect(() => {
    if (state?.success && state.data) {
      let newItem: TaskItemType
      if (taskType === "daily") {
        const task = state.data as DailyTask
        newItem = { ...task, is_completed: false }
      } else {
        const todo = state.data as GeneralTodo
        newItem = { ...todo, is_completed: todo.is_completed }
      }

      setItems((prev) => [...prev, newItem])

      setPopoverOpen(false)
      formRef.current?.reset()
    }
  }, [state, taskType])

  const sortedItems = useMemo(() => {
    if (taskType === "general") {
      return [...items].sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1
        }
        return a.sort_order - b.sort_order
      })
    }
    return items
  }, [items, taskType])

  const handleToggle = (id: string, isCompleted: boolean) => {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: isCompleted } : t))
    )
    startTransition(async () => {
      await toggleAction(id, isCompleted)
    })
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }

  const handleUpdate = (updatedItem: TaskItemType) => {
    setItems((prev) =>
      prev.map((t) => (t.id === updatedItem.id ? updatedItem : t))
    )
  }

  const didDragEnd = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!didDragEnd.current) return
    didDragEnd.current = false
    const itemsToUpdate = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }))
    startTransition(async () => {
      await updateOrderAction(itemsToUpdate)
    })
  }, [items, updateOrderAction])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      didDragEnd.current = true
      setItems((current) => {
        const oldIndex = current.findIndex((t) => t.id === active.id)
        const newIndex = current.findIndex((t) => t.id === over.id)
        return arrayMove(current, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="flex flex-col overflow-x-hidden">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form ref={formRef} action={formAction} className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add {title}</h4>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task">Task</Label>
                <Input id="task" name="task" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="link">Link (Optional)</Label>

                <Input id="link" name="link" placeholder="example.com" />
              </div>

              {state?.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}

              <SubmitButton pendingText="Adding...">Add Task</SubmitButton>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={sortedItems.map((t) => t.id)}>
          <div className="flex flex-col gap-1">
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <TaskItem
                  key={item.id}
                  item={item}
                  taskType={taskType}
                  onToggleAction={handleToggle}
                  onDeleteAction={handleDelete}
                  onUpdateAction={handleUpdate}
                />
              ))
            ) : (
              <p className="p-2 text-xs text-muted-foreground">
                No tasks yet. Click the + to add one.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
