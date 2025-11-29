import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import {
  ArrowRight,
  CalendarDays,
  Layout,
  LayoutDashboard,
  MonitorPlay,
  Newspaper,
  Play,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = [
    {
      icon: <Layout className="h-6 w-6 text-blue-500" />,
      title: "New Tab Dashboard",
      description:
        "Replace your browser tab with a beautiful, data-rich dashboard.",
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-orange-500" />,
      title: "Daily Focus",
      description:
        "Manage daily tasks and view your calendar events at a glance.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Market & News",
      description:
        "Track your favorite stocks and read top headlines globally.",
    },
    {
      icon: <Newspaper className="h-6 w-6 text-purple-500" />,
      title: "Markdown Notes",
      description: "Write and organize notes with a distraction-free editor.",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center bg-background selection:bg-primary/10">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <Header />

        <div className="flex w-full max-w-5xl flex-1 flex-col items-center gap-16">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-6 text-center">
            <Badge variant="secondary" className="px-4 py-1">
              v1.0 is live
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Your Personal <br />
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Productivity Cloud
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Stratus Dash brings your tasks, news, weather, and stocks together
              in a fast, modern dashboard. Manage your life from a single tab.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 gap-2 px-8 text-base"
                  >
                    <Link href="/new-tab">
                      <MonitorPlay className="h-4 w-4" />
                      Open New Tab
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 gap-2 px-8 text-base"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      Manage Notes
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 px-8 text-base">
                    <Link href="/auth/sign-up">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 gap-2 px-8 text-base"
                  >
                    <Link href="/demo">
                      <Play className="h-4 w-4" />
                      Try Demo
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="border-muted/50 bg-secondary/20 transition-all hover:bg-secondary/40"
              >
                <CardHeader>
                  <div className="mb-2 w-fit rounded-lg bg-background p-3 shadow-sm ring-1 ring-border">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </main>
  )
}
