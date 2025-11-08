import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-full min-h-svh w-full flex-1 flex-col items-center justify-center p-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
