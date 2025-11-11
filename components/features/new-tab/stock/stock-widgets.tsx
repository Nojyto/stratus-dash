"use client"

import type { StockData } from "@/types/new-tab"
import { StockTicker } from "./stock-ticker"

export function StockWidgets({
  initialData,
}: {
  initialData: StockData[] | null
}) {
  if (!initialData || initialData.length === 0) {
    return null
  }

  return (
    <>
      {initialData.map((stock) => (
        <StockTicker key={stock.symbol} data={stock} />
      ))}
    </>
  )
}
