import { vi } from "vitest"

vi.mock("@/lib/env", () => ({
  env: {
    UNSPLASH_ACCESS_KEY: "mock_unsplash_key",
    OPENWEATHER_API_KEY: "mock_weather_key",
    NEWS_API_KEY: "mock_news_key",
    STOCK_API_KEY: "mock_stock_key",
    NEXT_PUBLIC_SUPABASE_URL: "https://mock.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "mock_anon_key",
    RESTRICT_SIGNUP: false,
    ALLOWED_EMAILS: [],
  },
}))
