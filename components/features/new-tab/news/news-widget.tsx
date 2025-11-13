"use client"

import { fetchMoreNews } from "@/app/new-tab/actions/news"
import { Button } from "@/components/ui/button"
import type { NewsArticle, UserSettings } from "@/types/new-tab"
import { Loader2, Newspaper, X } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { NewsArticleCard } from "./news-article-card"
import { NewsSettings } from "./news-settings"

type NewsWidgetProps = {
  initialNews: NewsArticle[] | null
  initialSettings: UserSettings
  isExpanded: boolean
  setIsExpandedAction: (isExpanded: boolean) => void
}

export function NewsWidget({
  initialNews,
  initialSettings,
  isExpanded,
  setIsExpandedAction,
}: NewsWidgetProps) {
  const [articles, setArticles] = React.useState(initialNews ?? [])
  const [page, setPage] = React.useState(2)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState((initialNews?.length ?? 0) > 0)
  const loaderRef = React.useRef(null)
  const [imgError, setImgError] = React.useState(false)

  React.useEffect(() => {
    setArticles(initialNews ?? [])
    setPage(2)
    setHasMore((initialNews?.length ?? 0) > 0)
    setImgError(false)
  }, [initialNews])

  const loadMoreArticles = React.useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const newArticles = await fetchMoreNews(page)
      if (newArticles && newArticles.length > 0) {
        const newUniqueArticles = newArticles.filter(
          (newArticle) =>
            !articles.find((existing) => existing.url === newArticle.url)
        )
        setArticles((prev) => [...prev, ...newUniqueArticles])
        setPage((prev) => prev + 1)
        if (newArticles.length < 10) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to load more news:", error)
      setHasMore(false)
    }

    setIsLoading(false)
  }, [isLoading, hasMore, page, articles])

  React.useEffect(() => {
    if (!isExpanded) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreArticles()
        }
      },
      { threshold: 1.0 }
    )

    const loaderElement = loaderRef.current
    if (loaderElement) {
      observer.observe(loaderElement)
    }

    return () => {
      if (loaderElement) {
        observer.unobserve(loaderElement)
      }
    }
  }, [isExpanded, loadMoreArticles])

  if (isExpanded) {
    return (
      <>
        <div
          onClick={() => setIsExpandedAction(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 pt-12 backdrop-blur-sm animate-in fade-in-0 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative mx-auto max-w-6xl"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpandedAction(false)}
              className="absolute -top-2 right-0 h-8 w-8 rounded-full text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
              Top Headlines
            </h2>
            <NewsSettings initialSettings={initialSettings} />

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article) => (
                  <NewsArticleCard key={article.url} article={article} />
                ))}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                <Newspaper className="h-8 w-8" />
                <p className="text-sm font-medium">
                  No articles found for your selected filters.
                </p>

                <p className="text-xs">Try adjusting the settings above.</p>
              </div>
            )}

            <div
              ref={loaderRef}
              className="flex h-20 items-center justify-center"
            >
              {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}

              {!hasMore && articles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  No more articles
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  const firstArticle = articles.length > 0 ? articles[0] : null

  return (
    <button
      onClick={() => setIsExpandedAction(true)}
      className="group relative mx-auto mb-0.5 w-full max-w-md cursor-pointer overflow-hidden rounded-lg bg-secondary/50 text-left text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-secondary/75 hover:shadow-lg"
    >
      {firstArticle ? (
        <div className="relative h-20 w-full">
          {!imgError && (
            <Image
              src={firstArticle.urlToImage}
              alt={firstArticle.title}
              fill
              className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
              sizes="500px"
              priority
              onError={() => setImgError(true)}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-3">
            <span className="mb-0.5 block text-xs font-medium text-white/90">
              {firstArticle.sourceName}
            </span>

            <p className="truncate text-sm font-semibold text-white">
              {firstArticle.title}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-20 w-full items-center justify-center p-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-semibold">No news found</p>

            <p className="text-xs text-muted-foreground">
              Click to adjust news settings
            </p>
          </div>
        </div>
      )}
    </button>
  )
}
