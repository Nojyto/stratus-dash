import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TasksWidget } from "./tasks-widget"

vi.mock("@/contexts/NewTabContext", () => ({
  useNewTab: vi.fn(() => ({
    isDemo: false,
  })),
}))

describe("TasksWidget", () => {
  it("renders both Daily Tasks and General Todos lists", () => {
    render(<TasksWidget initialDailyTasks={[]} initialGeneralTodos={[]} />)

    expect(screen.getByText("Daily Tasks")).toBeDefined()
    expect(screen.getByText("General Todos")).toBeDefined()
    expect(screen.getAllByText("No tasks yet.")).toHaveLength(2)
  })
})
