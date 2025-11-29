"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Menu, MonitorPlay, NotebookPen, Play } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavigationProps = {
  isLoggedIn: boolean
}

export function Navigation({ isLoggedIn }: NavigationProps) {
  const pathname = usePathname()

  const routes = isLoggedIn
    ? [
        {
          href: "/new-tab",
          label: "New Tab",
          icon: MonitorPlay,
        },
        {
          href: "/dashboard",
          label: "Notes",
          icon: NotebookPen,
        },
      ]
    : [
        {
          href: "/demo",
          label: "Try Demo",
          icon: Play,
        },
      ]

  return (
    <>
      <div className="hidden gap-1 md:flex">
        {routes.map((route) => {
          const isActive = pathname === route.href
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              <span>{route.label}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-[13px] mx-auto h-[2px] w-full rounded-t-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {routes.map((route) => (
              <DropdownMenuItem key={route.href} asChild>
                <Link
                  href={route.href}
                  className={cn(
                    "flex cursor-pointer items-center gap-2",
                    pathname === route.href && "bg-accent"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
