"use server"

import type { NewsArticle } from "@/types/new-tab"
import { unstable_cache as cache } from "next/cache"
import { env } from "../env"

type NewsApiArticle = {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

type NewsApiResponse = {
  status: string
  totalResults: number
  articles: NewsApiArticle[]
  code?: string
  message?: string
}

const PAGE_SIZE = 10

export const getNews = cache(
  async (
    country: string,
    categories: string[],
    page: number
  ): Promise<NewsArticle[] | null> => {
    const apiKey = env.NEWS_API_KEY
    const validCategories =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : ["general"]

    const allArticles: NewsApiArticle[] = []

    try {
      const requests = validCategories.map((category) => {
        const url = `https://newsapi.org/v2/top-headlines?country=${
          country || "us"
        }&category=${category}&page=${page}&pageSize=${PAGE_SIZE}&apiKey=${apiKey}`
        return fetch(url)
      })

      const responses = await Promise.all(requests)

      for (const res of responses) {
        if (!res.ok) {
          const errorData: NewsApiResponse = await res.json()
          console.error(
            `Failed to fetch news data (status ${res.status}):`,
            errorData.message
          ) // Continue even if one category fails
          continue
        }

        const data: NewsApiResponse = await res.json()

        if (data.status !== "ok") {
          console.error(
            "[External API: News] returned non-ok status:",
            data.message
          )
          continue
        }

        allArticles.push(...data.articles)
      }

      const uniqueArticles = new Map<string, NewsApiArticle>()
      for (const article of allArticles) {
        if (!uniqueArticles.has(article.url)) {
          uniqueArticles.set(article.url, article)
        }
      }

      const formattedArticles = Array.from(uniqueArticles.values())
        .filter(
          (article) =>
            article.title &&
            article.title !== "[Removed]" &&
            article.description &&
            article.description !== "[Removed]" &&
            article.url &&
            article.urlToImage
        )
        .map((article) => ({
          title: article.title,
          description: article.description || "",
          url: article.url,
          sourceName: article.source.name,
          urlToImage: article.urlToImage!,
          author: article.author || null,
          publishedAt: article.publishedAt,
        }))
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )

      return formattedArticles
    } catch (e) {
      console.error(
        "[External API: News] Error fetching or parsing data:",
        e instanceof Error ? e.message : String(e)
      )
      return null
    }
  },
  ["news-data"],
  { revalidate: 3600 }
)
