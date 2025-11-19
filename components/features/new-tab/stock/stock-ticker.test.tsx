import { StockData } from "@/types/new-tab"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StockTicker } from "./stock-ticker"

const mockPositiveStock: StockData = {
  symbol: "AAPL",
  current: 150.0,
  change: 2.5,
  percentChange: 1.67,
  previousClose: 147.5,
  urlSymbol: "AAPL:NASDAQ",
}

const mockNegativeStock: StockData = {
  symbol: "TSLA",
  current: 200.0,
  change: -5.0,
  percentChange: -2.44,
  previousClose: 205.0,
  urlSymbol: "TSLA:NASDAQ",
}

describe("StockTicker", () => {
  it("renders stock symbol and price", () => {
    render(<StockTicker data={mockPositiveStock} />)
    expect(screen.getByText("AAPL")).toBeDefined()
    expect(screen.getByText("150.00")).toBeDefined()
  })

  it("formats positive change with green color", () => {
    render(<StockTicker data={mockPositiveStock} />)

    const percentageEl = screen.getByText("+1.67%")
    expect(percentageEl.parentElement?.className).toContain("text-green-400")
  })

  it("formats negative change with red color", () => {
    render(<StockTicker data={mockNegativeStock} />)

    const percentageEl = screen.getByText("-2.44%")
    expect(percentageEl.parentElement?.className).toContain("text-red-400")
  })

  it("generates correct external link", () => {
    render(<StockTicker data={mockPositiveStock} />)
    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toBe(
      "https://www.google.com/finance/quote/AAPL:NASDAQ"
    )
  })
})
