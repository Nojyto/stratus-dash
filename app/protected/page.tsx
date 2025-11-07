import { Button } from "@/components/ui/button"
import { getSupabaseWithUser } from "@/lib/supabase/utils"
import { InfoIcon } from "lucide-react"
import Link from "next/link"

export default async function ProtectedPage() {
  const { user } = await getSupabaseWithUser()

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 rounded-md bg-accent p-3 px-5 text-sm text-foreground">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user.
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Welcome, {user.email}</h2>
        <p>You are now logged in. You can proceed to your dashboard.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
