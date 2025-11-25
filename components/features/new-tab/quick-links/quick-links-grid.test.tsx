import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QuickLinksGrid } from "./quick-links-grid"

const mockLink = {
  id: "1",
  title: "Google",
  url: "https://google.com",
  user_id: "user-1",
  sort_order: 0,
}

vi.mock("@/contexts/NewTabContext", () => ({
  useNewTab: vi.fn(() => ({
    links: [mockLink],
    settings: {
      user_id: "user-1",
    },
    wallpaper: {},
    generalTodos: [],
    dailyTasks: [],
    isEditing: false,
    isUIVisible: false,
    setIsEditing: vi.fn(),
    updateLinks: vi.fn(),
    updateWallpaperInfo: vi.fn(),
    updateSettings: vi.fn(),
    setUIVisibility: vi.fn(),
  })),
}))

describe("QuickLinksGrid", () => {
  it("renders the list of quick links from context", () => {
    render(<QuickLinksGrid />)
    expect(screen.getByText("Google")).toBeDefined()
  })
})
