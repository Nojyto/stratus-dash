import Link from "next/link"
import { AuthButton } from "../common/auth-button"
import { ThemeSwitcher } from "../common/theme-switcher"

export function Header() {
  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-7xl items-center justify-between p-3 px-5 text-sm">
        <div className="flex items-center gap-5 font-semibold">
          <Link href={"/"}>Stratus Dash</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
