import { z } from "zod"

const envSchema = z.object({
  // --- Server-Side Secrets ---
  UNSPLASH_ACCESS_KEY: z.string().min(1, "Unsplash API Key is required"),
  OPENWEATHER_API_KEY: z.string().min(1, "OpenWeather API Key is required"),
  NEWS_API_KEY: z.string().min(1, "News API Key is required"),
  STOCK_API_KEY: z.string().min(1, "Stock API Key is required"),

  // --- Config Flags ---
  RESTRICT_SIGNUP: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  // --- Access Control ---
  ALLOWED_EMAILS: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(",").map((e) => e.trim().toLowerCase()) : []
    ),

  // --- Supabase ---
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    "\n❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsed.data
