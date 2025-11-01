import { NewTabSkeleton } from "@/components/features/new-tab/new-tab-skeleton"
import { Suspense } from "react"
import { NewTabData } from "./new-tab-data"

export default function NewTabPage() {
  return (
    <Suspense fallback={<NewTabSkeleton />}>
      <NewTabData />
    </Suspense>
  )
}
