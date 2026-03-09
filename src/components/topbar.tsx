"use client"

import { ModeToggle } from "./mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function Topbar({ email }: { email?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        {email && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            {email}
          </span>
        )}
        <ModeToggle />
      </div>
    </header>
  )
}
