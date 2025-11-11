"use server"

import type { StockData } from "@/types/new-tab"
import { unstable_cache as cache } from "next/cache"
import { STOCK_PRESETS } from "./stock-options"

type FinnhubQuote = {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
  t: number
}

async function fetchStockQuote(
  symbol: string,
  apiKey: string
): Promise<StockData | null> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error(
        `Failed to fetch stock data for ${symbol}: ${res.statusText}`
      )
      return null
    }

    const data: FinnhubQuote = await res.json()

    if (data.c === 0 && data.pc === 0) {
      console.warn(`No data returned for symbol: ${symbol}`)
      return null
    }

    const preset = STOCK_PRESETS.find((p) => p.value === symbol)
    const urlSymbol = preset ? preset.urlSymbol : symbol

    return {
      symbol: symbol,
      current: data.c,
      change: data.d,
      percentChange: data.dp,
      previousClose: data.pc,
      urlSymbol: urlSymbol,
    }
  } catch (e) {
    console.error(
      `Error fetching or parsing stock data for ${symbol}:`,
      e instanceof Error ? e.message : String(e)
    )
    return null
  }
}

export const getStockData = cache(
  async (symbols: string[]): Promise<StockData[] | null> => {
    const apiKey = process.env.STOCK_API_KEY
    if (!apiKey) {
      console.error("STOCK_API_KEY is not set.")
      return null
    }

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return []
    }

    const stockPromises = symbols.map((symbol) =>
      fetchStockQuote(symbol, apiKey)
    )
    const results = await Promise.all(stockPromises)

    return results.filter((stock): stock is StockData => stock !== null)
  },
  ["stock-data"],
  { revalidate: 300 }
)
