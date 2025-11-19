"use client"

import { cn, formatTimeAgo } from "@/lib/utils"
import type { NewsArticle } from "@/types/new-tab"
import { Loader2, Newspaper } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

type NewsArticleCardProps = {
  article: NewsArticle
}

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  const [imgError, setImgError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setImgError(false)
    setIsLoading(true)
  }, [article.urlToImage])

  return (
    <a
      href={article.url}
      className="group flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-md transition-all hover:shadow-xl"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full bg-secondary/20">
        {isLoading && !imgError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          </div>
        )}

        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <Newspaper className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : (
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              isLoading ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            onError={() => {
              setImgError(true)
              setIsLoading(false)
            }}
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-xs font-medium text-primary">
          {article.sourceName}
        </span>

        <h3 className="mb-2 line-clamp-2 font-semibold group-hover:underline">
          {article.title}
        </h3>

        <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {article.description}
        </p>
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="max-w-[60%] truncate" title={article.author ?? ""}>
            {article.author}
          </span>
          <span suppressHydrationWarning>
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>
      </div>
    </a>
  )
}
