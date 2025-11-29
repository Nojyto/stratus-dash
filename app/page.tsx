import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight, LayoutDashboard, MonitorPlay } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <Header />
        <div className="flex max-w-5xl flex-1 flex-col items-center justify-center gap-12 p-5 text-center">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Your Personal Productivity Cloud
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Stratus Dash brings your tasks, news, weather, and stocks together
              in a fast, modern dashboard. Manage your life from a single tab.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/new-tab">
                    <MonitorPlay className="h-4 w-4" />
                    Open New Tab
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Manage Notes
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/auth/sign-up">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </main>
  )
}
