"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter } from "@/components/date-range-filter"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, Landmark } from "lucide-react"

interface PaymentAsset {
  name: string
  income: number
  expense: number
  asset: number
}

export function AssetsView({
  paymentAssets,
  totalIncome,
  totalExpense,
  totalAsset,
}: {
  paymentAssets: PaymentAsset[]
  totalIncome: number
  totalExpense: number
  totalAsset: number
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
      </div>

      <DateRangeFilter />

      {/* Overall Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500 font-mono">
              +Rp {totalIncome.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500 font-mono">
              -Rp {totalExpense.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asset</CardTitle>
            <WalletIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalAsset >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              Rp {totalAsset.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Payment Method Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Per Payment Method</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentAssets.length > 0 ? (
            paymentAssets.map((pa) => (
              <Card key={pa.name} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${pa.asset >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    {pa.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={`text-xl font-bold font-mono ${pa.asset >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    Rp {pa.asset.toLocaleString("id-ID")}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
                      +Rp {pa.income.toLocaleString("id-ID")}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDownIcon className="h-3 w-3 text-rose-500" />
                      -Rp {pa.expense.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {/* Progress bar showing income vs expense ratio */}
                  <div className="h-1.5 w-full bg-rose-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${pa.income + pa.expense > 0 ? (pa.income / (pa.income + pa.expense)) * 100 : 50}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No transactions found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
