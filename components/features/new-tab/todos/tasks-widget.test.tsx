import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TasksWidget } from "./tasks-widget"

describe("TasksWidget", () => {
  it("renders both Daily Tasks and General Todos lists", () => {
    render(<TasksWidget initialDailyTasks={[]} initialGeneralTodos={[]} />)

    expect(screen.getByText("Daily Tasks")).toBeDefined()
    expect(screen.getByText("General Todos")).toBeDefined()
    expect(
      screen.getAllByText("No tasks yet. Click the + to add one.")
    ).toHaveLength(2)
  })
})
