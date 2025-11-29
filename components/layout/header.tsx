import { createClient } from "@/lib/supabase/server"
import { Notebook } from "lucide-react"
import Link from "next/link"
import { AuthButton } from "../common/auth-button"
import { ThemeSwitcher } from "../common/theme-switcher"
import { Navigation } from "./navigation"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 flex h-14 w-full justify-center border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full max-w-7xl items-center justify-between px-5 py-3 text-sm">
        <div className="flex items-center gap-6">
          <Link
            href={"/"}
            className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
          >
            <Notebook />
            <span>Stratus Dash</span>
          </Link>

          <Navigation isLoggedIn={!!user} />
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
