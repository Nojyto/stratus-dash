export function QuickLinksSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex w-20 flex-col items-center gap-1.5">
          <div className="shimmer-bg h-14 w-14 rounded-2xl"></div>
          <div className="shimmer-bg h-4 w-16 rounded-md"></div>
        </div>
      ))}
    </div>
  )
}
