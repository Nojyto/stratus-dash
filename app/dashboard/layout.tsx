import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center">
        <Header />
        <div className="w-full max-w-7xl flex-1 p-5">{children}</div>
        <Footer />
      </div>
    </main>
  )
}
