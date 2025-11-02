export function NewTabSkeleton() {
  return (
    <div className="flex w-full flex-1 animate-pulse flex-col items-center justify-center gap-12 p-6">
      {/* Placeholder for Quick Links */}
      <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex w-20 flex-col items-center gap-1.5">
            <div className="h-12 w-12 rounded-full bg-secondary/80"></div>
            <div className="h-4 w-16 rounded-md bg-secondary/80"></div>
          </div>
        ))}
      </div>

      {/* Placeholder for Search Bar */}
      <div className="h-12 w-full max-w-lg rounded-full bg-secondary/80"></div>
    </div>
  )
}
