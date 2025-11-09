"use client"

import { formatTimeAgo } from "@/lib/utils"
import type { NewsArticle } from "@/types/new-tab"
import Image from "next/image"

type NewsArticleCardProps = {
  article: NewsArticle
}

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  return (
    <a
      href={article.url}
      className="group flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-md transition-all hover:shadow-xl"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full">
        <Image
          src={article.urlToImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
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
          <span>{formatTimeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  )
}
