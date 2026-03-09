"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface ChartDataPoint {
  name: string
  pemasukan: number
  pengeluaran: number
}

export function OverviewChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No transaction data available for this period.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${(value as number) / 1000000}M`}
        />
        <Tooltip formatter={(value) => `Rp ${(value as number).toLocaleString("id-ID")}`} />
        <Legend />
        <Bar dataKey="pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} name="Pemasukan" />
        <Bar dataKey="pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Pengeluaran" />
      </BarChart>
    </ResponsiveContainer>
  )
}
