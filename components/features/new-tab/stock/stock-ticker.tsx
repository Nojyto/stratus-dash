"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { StockData } from "@/types/new-tab"
import { TrendingDown, TrendingUp } from "lucide-react"

export function StockTicker({ data }: { data: StockData }) {
  const { symbol, current, change, percentChange, urlSymbol } = data
  const isPositive = change >= 0
  const formattedPercentChange = isPositive
    ? `+${percentChange.toFixed(2)}%`
    : `${percentChange.toFixed(2)}%`

  const getFontSize = (symbol: string) => {
    if (symbol.length > 5) return "text-xs"
    if (symbol.length > 3) return "text-sm"
    return "text-base"
  }

  const externalUrl = `https://www.google.com/finance/quote/${urlSymbol}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-auto w-full cursor-pointer items-center rounded-full bg-secondary/50 p-2 px-3 text-left text-foreground backdrop-blur-sm transition-colors hover:bg-secondary/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex w-full items-center justify-between gap-3">
            <span
              className={cn(
                "w-10 truncate font-bold group-hover:underline",
                getFontSize(symbol)
              )}
            >
              {symbol}
            </span>
            <div className="flex flex-col items-end">
              <span className="font-semibold">{current.toFixed(2)}</span>
              <span
                className={cn(
                  "text-xs",
                  isPositive ? "text-green-400" : "text-red-400"
                )}
              >
                {formattedPercentChange}
              </span>
            </div>
          </div>
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span>View more about {symbol}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
