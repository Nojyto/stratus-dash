import { NewTabContent } from "@/components/features/new-tab/new-tab-content"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNewTabItems } from "./actions"

export default async function NewTabPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { links, settings } = await getNewTabItems()

  return (
    <NewTabContent
      userEmail={user.email ?? ""}
      initialLinks={links}
      initialSettings={settings}
    />
  )
}
