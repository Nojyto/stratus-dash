import { Notebook } from "lucide-react"
import Link from "next/link"
import { AuthButton } from "../common/auth-button"
import { ThemeSwitcher } from "../common/theme-switcher"

export function Header() {
  return (
    <nav className="flex h-12 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-7xl items-center justify-between px-5 py-3 text-sm">
        <div className="flex items-center gap-1 font-semibold">
          <Link href={"/"}>
            <Notebook />
          </Link>
          <Link href={"/"}>Stratus Dash</Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher onOpenChangeAction={() => {}} />
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
