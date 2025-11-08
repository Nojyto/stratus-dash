"use client"

import { logout } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useTransition } from "react"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={() => {
        startTransition(async () => {
          await logout()
        })
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        disabled={isPending}
        type="submit"
      >
        <LogOut />
      </Button>
    </form>
  )
}
