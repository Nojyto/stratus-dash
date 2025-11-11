"use client"

import {
  deleteDailyTask,
  deleteGeneralTodo,
  updateDailyTask,
  updateGeneralTodo,
} from "@/app/new-tab/actions/todos"
import { SubmitButton } from "@/components/common/submit-button"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn, getHostname } from "@/lib/utils"
import type {
  DailyTask,
  FormState,
  GeneralTodo,
  TaskItemType,
} from "@/types/new-tab"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Edit, GripVertical, Link, Trash2 } from "lucide-react"
import Image from "next/image"
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

type TaskItemProps = {
  item: TaskItemType
  taskType: "daily" | "general"
  onToggleAction: (id: string, isCompleted: boolean) => void
  onDeleteAction: (id: string) => void
  onUpdateAction: (item: TaskItemType) => void
}

export function TaskItem({
  item,
  taskType,
  onToggleAction,
  onDeleteAction,
  onUpdateAction,
}: TaskItemProps) {
  const [isTogglePending, startToggleTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isQuickDeletePending, startQuickDeleteTransition] = useTransition()
  const [imgError, setImgError] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.7 : 1,
  }

  const handleCheckedChange = (checked: boolean) => {
    startToggleTransition(() => {
      onToggleAction(item.id, checked)
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      onDeleteAction(item.id)
      setPopoverOpen(false)
      if (taskType === "daily") {
        await deleteDailyTask(item.id)
      } else {
        await deleteGeneralTodo(item.id)
      }
    })
  }

  const handleQuickDelete = () => {
    if (taskType !== "general") return

    startQuickDeleteTransition(async () => {
      onDeleteAction(item.id)
      await deleteGeneralTodo(item.id)
    })
  }
  const [state, formAction] = useActionState<FormState | null, FormData>(
    taskType === "daily" ? updateDailyTask : updateGeneralTodo,
    null
  )

  const onUpdateActionRef = useRef(onUpdateAction)
  const itemRef = useRef(item)
  const taskTypeRef = useRef(taskType)

  useEffect(() => {
    onUpdateActionRef.current = onUpdateAction
    itemRef.current = item
    taskTypeRef.current = taskType
  })

  useEffect(() => {
    if (state?.success) {
      setPopoverOpen(false)
      if (state.data) {
        const currentOnUpdate = onUpdateActionRef.current
        const currentItem = itemRef.current
        const currentTaskType = taskTypeRef.current

        const updatedItem = state.data as DailyTask | GeneralTodo

        if (currentTaskType === "daily") {
          currentOnUpdate({
            ...updatedItem,
            is_completed: currentItem.is_completed,
          })
        } else {
          currentOnUpdate({
            ...updatedItem,
            is_completed: (updatedItem as GeneralTodo).is_completed,
          })
        }
      }
    }
  }, [state])

  const hostname = item.link ? getHostname(item.link) : null

  useEffect(() => {
    setImgError(false)
  }, [item.link])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex w-full items-center gap-1 rounded-md p-0.5 transition-colors hover:bg-secondary/75",
        item.is_completed && "opacity-60"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <Checkbox
        id={item.id}
        checked={item.is_completed}
        onCheckedChange={handleCheckedChange}
        disabled={isTogglePending || isQuickDeletePending}
        className="mx-1"
      />

      <label
        htmlFor={item.id}
        className={cn(
          "flex-1 cursor-pointer truncate text-sm",
          item.is_completed && "line-through"
        )}
      >
        {item.task}
      </label>

      {hostname && (
        <a
          href={item.link!}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {imgError ? (
            <Link className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Image
              src={`https://icons.duckduckgo.com/ip3/${hostname}.ico`}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
              onError={() => setImgError(true)}
            />
          )}
        </a>
      )}
      {item.is_completed && taskType === "general" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 flex-shrink-0 hover:bg-destructive/75 hover:text-destructive"
          onClick={handleQuickDelete}
          disabled={isQuickDeletePending || isTogglePending}
          aria-label="Delete completed task"
        >
          <Trash2 className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80">
          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="id" value={item.id} />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Edit Task</h4>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-task-${item.id}`}>Task</Label>
              <Input
                id={`edit-task-${item.id}`}
                name="task"
                defaultValue={item.task}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`edit-link-${item.id}`}>Link (Optional)</Label>

              <Input
                id={`edit-link-${item.id}`}
                name="link"
                defaultValue={item.link || ""}
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeletePending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeletePending ? "Deleting..." : "Delete"}
              </Button>
              <SubmitButton pendingText="Saving..." disabled={isDeletePending}>
                Save
              </SubmitButton>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
