export function TaskSkeleton() {
  return (
    <div className="flex h-full w-64 flex-col gap-2 rounded-lg bg-secondary/50 p-4 backdrop-blur-sm">
      <div className="shimmer-bg h-6 w-32 rounded-md"></div>
      <div className="shimmer-bg h-8 w-full rounded-md"></div>
      <div className="shimmer-bg h-8 w-full rounded-md"></div>
      <div className="shimmer-bg h-8 w-full rounded-md"></div>
    </div>
  )
}
