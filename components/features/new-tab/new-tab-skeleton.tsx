export function NewTabSkeleton() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start gap-12 p-6 pt-32">
      {/* Placeholder for Quick Links */}
      <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex w-20 flex-col items-center gap-1.5">
            <div className="shimmer-bg h-14 w-14 rounded-full"></div>
            <div className="shimmer-bg h-4 w-16 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Placeholder for Search Bar */}
      <div className="shimmer-bg h-12 w-full max-w-lg rounded-full"></div>
    </div>
  )
}
