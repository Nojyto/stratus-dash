import { absoluteUrl } from "@/lib/utils"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Geist } from "next/font/google"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Stratus Dash",
    template: "%s | Stratus Dash",
  },
  description:
    "A personal productivity dashboard that replaces your browser's New Tab page. Features quick access to links, daily tasks, weather, stocks, news, and more.",
  openGraph: {
    title: "Stratus Dash - Personal Productivity Dashboard",
    description:
      "A fast, modern dashboard for your browser. Manage tasks, view weather & news, track stocks, and write notes all in one place.",
    type: "website",
    locale: "en_US",
    url: new URL(absoluteUrl("/")),
    siteName: "Stratus Dash",
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
