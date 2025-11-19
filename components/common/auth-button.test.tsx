import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AuthButton } from "./auth-button"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  }),
}))

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe("AuthButton", () => {
  it("renders Sign In and Sign Up buttons when user is null", async () => {
    const result = await AuthButton()
    render(result)

    expect(screen.getByText("Sign in")).toBeDefined()
    expect(screen.getByText("Sign up")).toBeDefined()
  })
})
