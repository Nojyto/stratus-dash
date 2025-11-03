import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/new-tab")
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <Header />
        <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">
          <main className="flex flex-1 flex-col gap-6 px-4">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </main>
        </div>
        <Footer />
      </div>
    </main>
  )
}
