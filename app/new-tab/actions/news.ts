"use server"

import { getNews } from "@/lib/external/news"
import { createClient } from "@/lib/supabase/server"

export async function fetchMoreNews(page: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("news_country, news_category")
    .eq("user_id", user.id)
    .single()

  const country = settings?.news_country ?? "us"
  const categories = settings?.news_category ?? ["general"]

  const newArticles = await getNews(country, categories, page)

  return newArticles
}
