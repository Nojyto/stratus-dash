export function StockSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shimmer-bg h-16 w-32 rounded-full"></div>
      ))}
    </>
  )
}
