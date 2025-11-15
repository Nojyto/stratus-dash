import { getStockDataForUser } from "@/app/new-tab/actions/data"
import type { UserSettings } from "@/types/new-tab"
import { StockWidgets } from "./stock-widgets"

export async function StockLoader({ settings }: { settings: UserSettings }) {
  const stocks = await getStockDataForUser(settings)
  return <StockWidgets initialData={stocks} />
}
