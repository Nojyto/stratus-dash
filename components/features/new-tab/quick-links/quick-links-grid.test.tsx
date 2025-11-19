import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QuickLinksGrid } from "./quick-links-grid"

const mockLink = {
  id: "1",
  title: "Google",
  url: "https://google.com",
  user_id: "user-1",
  sort_order: 0,
}

describe("QuickLinksGrid", () => {
  it("renders the list of quick links", () => {
    render(
      <QuickLinksGrid
        initialLinks={[mockLink]}
        isEditing={false}
        userId="user-1"
      />
    )
    expect(screen.getByText("Google")).toBeDefined()
  })
})
