export default function Loading() {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-12 p-6 pt-32">
      {/* Top Left Weather Placeholder */}
      <div className="shimmer-bg absolute left-6 top-6 h-14 w-48 rounded-full"></div>

      {/* Quick Links Placeholder */}
      <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex w-20 flex-col items-center gap-1.5">
            <div className="shimmer-bg h-12 w-12 rounded-full"></div>
            <div className="shimmer-bg h-4 w-16 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Search Bar Placeholder */}
      <div className="shimmer-bg h-12 w-full max-w-lg rounded-full"></div>
    </div>
  )
}
