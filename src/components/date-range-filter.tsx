"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays } from "lucide-react"

export function DateRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")

  function applyFilter() {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    router.push(`?${params.toString()}`)
  }

  function clearFilter() {
    setFrom("")
    setTo("")
    router.push("?")
  }

  function setPreset(preset: string) {
    const now = new Date()
    let start = new Date()

    switch (preset) {
      case "week":
        start.setDate(now.getDate() - 7)
        break
      case "month":
        start.setMonth(now.getMonth() - 1)
        break
      case "all":
        setFrom("")
        setTo("")
        router.push("?")
        return
    }

    const fromStr = start.toISOString().split("T")[0]
    const toStr = now.toISOString().split("T")[0]
    setFrom(fromStr)
    setTo(toStr)

    const params = new URLSearchParams()
    params.set("from", fromStr)
    params.set("to", toStr)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={() => setPreset("week")}>
          Minggu Ini
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset("month")}>
          Bulan Ini
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset("all")}>
          Semua Waktu
        </Button>
      </div>

      {/* Custom Date Range */}
      <div className="flex items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 w-[140px] text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 w-[140px] text-xs"
          />
        </div>
        <Button size="sm" onClick={applyFilter} className="h-8">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          Filter
        </Button>
        {(from || to) && (
          <Button variant="ghost" size="sm" onClick={clearFilter} className="h-8 text-xs">
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
