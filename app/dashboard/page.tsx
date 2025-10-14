import { Dashboard } from "@/components/features/dashboard/dashboard"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDashboardItems } from "./actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { notes, folders } = await getDashboardItems()

  return <Dashboard initialNotes={notes} initialFolders={folders} />
}
