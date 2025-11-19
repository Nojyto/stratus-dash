import type { NewsArticle, UserSettings } from "@/types/new-tab"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NewsWidget } from "./news-widget"

const mockArticle: NewsArticle = {
  title: "Breaking News Story",
  description: "Something happened",
  url: "https://example.com",
  sourceName: "Test Source",
  urlToImage: "https://example.com/image.jpg",
  author: "John Doe",
  publishedAt: new Date().toISOString(),
}

const mockSettings = {} as UserSettings

describe("NewsWidget", () => {
  it("renders the headline of the first article", () => {
    render(
      <NewsWidget initialNews={[mockArticle]} initialSettings={mockSettings} />
    )
    expect(screen.getByText("Breaking News Story")).toBeDefined()
    expect(screen.getByText("Test Source")).toBeDefined()
  })
})
