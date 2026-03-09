import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { DateRangeFilter } from "@/components/date-range-filter"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with optional date range filters
  let query = supabase
    .from("transactions")
    .select("id, amount, description, transaction_type, transaction_date, master_categories ( name )")
    .order("transaction_date", { ascending: false })

  if (params.from) {
    query = query.gte("transaction_date", params.from)
  }
  if (params.to) {
    // Add a day to include the end date fully
    const toDate = new Date(params.to)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt("transaction_date", toDate.toISOString().split("T")[0])
  }

  const { data: transactions } = await query

  // Calculate totals
  let income = 0
  let expense = 0

  transactions?.forEach((tx) => {
    if (tx.transaction_type === "pemasukan") income += Number(tx.amount)
    if (tx.transaction_type === "pengeluaran") expense += Number(tx.amount)
  })

  const balance = income - expense

  // Build chart data — group by month
  const chartMap: Record<string, { pemasukan: number; pengeluaran: number }> = {}
  transactions?.forEach((tx) => {
    const date = new Date(tx.transaction_date)
    const key = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" })
    if (!chartMap[key]) chartMap[key] = { pemasukan: 0, pengeluaran: 0 }
    if (tx.transaction_type === "pemasukan") chartMap[key].pemasukan += Number(tx.amount)
    if (tx.transaction_type === "pengeluaran") chartMap[key].pengeluaran += Number(tx.amount)
  })

  const chartData = Object.entries(chartMap)
    .map(([name, values]) => ({ name, ...values }))
    .reverse()

  // Recent transactions (max 8)
  const recentTransactions = (transactions || []).slice(0, 8).map((tx: any) => ({
    id: tx.id,
    amount: tx.amount,
    description: tx.description,
    transaction_type: tx.transaction_type,
    transaction_date: tx.transaction_date,
    category_name: tx.master_categories?.name || "-",
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Date Range Filter */}
      <Suspense fallback={null}>
        <DateRangeFilter />
      </Suspense>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              Rp {balance.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500 font-mono">
              +Rp {income.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500 font-mono">
              -Rp {expense.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTransactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
