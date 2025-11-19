import { ClientVEvent } from "@/types/new-tab"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarWidget } from "./calendar-widget"

const mockEvents: ClientVEvent[] = [
  {
    uid: "1",
    summary: "Past Event",
    start: new Date(2024, 0, 1, 10, 0).toISOString(), // Jan 1 10:00
    end: new Date(2024, 0, 1, 11, 0).toISOString(),
    datetype: "datetime",
  },
  {
    uid: "2",
    summary: "Today Event",
    start: new Date(2024, 0, 2, 14, 0).toISOString(), // Jan 2 14:00
    end: new Date(2024, 0, 2, 15, 0).toISOString(),
    datetype: "datetime",
  },
  {
    uid: "3",
    summary: "Tomorrow Event",
    start: new Date(2024, 0, 3, 9, 0).toISOString(), // Jan 3 09:00
    end: new Date(2024, 0, 3, 10, 0).toISOString(),
    datetype: "datetime",
  },
]

describe("CalendarWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Set "Today" to Jan 2, 2024
    const date = new Date(2024, 0, 2, 12, 0, 0)
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("displays filtering message when calendar is not configured", () => {
    render(<CalendarWidget initialEvents={[]} hasCalendar={false} />)
    expect(screen.getByText(/Add your iCal URL/i)).toBeDefined()
  })

  it("displays 'Today' events by default", () => {
    render(<CalendarWidget initialEvents={mockEvents} hasCalendar={true} />)

    expect(screen.getByText("Today")).toBeDefined()
    expect(screen.getByText("Today Event")).toBeDefined()

    // Should not show events from other days
    expect(screen.queryByText("Past Event")).toBeNull()
    expect(screen.queryByText("Tomorrow Event")).toBeNull()
  })

  it("navigates to 'Tomorrow' and shows correct events", () => {
    render(<CalendarWidget initialEvents={mockEvents} hasCalendar={true} />)

    // Find the forward button (ChevronRight)
    // Since we don't have accessible names on the icon buttons in the component,
    // we rely on the button roles. The 3rd button is forward.
    const buttons = screen.getAllByRole("button")
    const nextButton = buttons[2]

    fireEvent.click(nextButton)

    expect(screen.getByText("Tomorrow")).toBeDefined()
    expect(screen.getByText("Tomorrow Event")).toBeDefined()
    expect(screen.queryByText("Today Event")).toBeNull()
  })

  it("navigates to 'Yesterday' and shows correct events", () => {
    render(<CalendarWidget initialEvents={mockEvents} hasCalendar={true} />)

    const buttons = screen.getAllByRole("button")
    const prevButton = buttons[0]

    fireEvent.click(prevButton)

    expect(screen.getByText("Yesterday")).toBeDefined()
    expect(screen.getByText("Past Event")).toBeDefined()
  })

  it("renders empty state message when no events exist for the day", () => {
    render(<CalendarWidget initialEvents={[]} hasCalendar={true} />)
    expect(screen.getByText("No events scheduled for this day.")).toBeDefined()
  })
})
