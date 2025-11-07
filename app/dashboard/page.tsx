import { Dashboard } from "@/components/features/dashboard/dashboard"
import { getDashboardItems } from "./actions"

export default async function DashboardPage() {
  const { notes, folders } = await getDashboardItems()

  return <Dashboard initialNotes={notes} initialFolders={folders} />
}
