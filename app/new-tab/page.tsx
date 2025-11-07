import { AuthButton } from "@/components/common/auth-button"
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

  const { links, settings, wallpaper, weather } = await getNewTabItems()

  return (
    <NewTabContent
      initialLinks={links}
      initialSettings={settings}
      initialWallpaper={wallpaper}
      initialWeather={weather}
      authButton={<AuthButton />}
    />
  )
}
