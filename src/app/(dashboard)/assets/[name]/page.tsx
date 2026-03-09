import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangeFilter } from "@/components/date-range-filter"

export default async function AssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const [{ name }, filters, supabase] = await Promise.all([
    params,
    searchParams,
    createClient(),
  ])

  const paymentName = decodeURIComponent(name)

  // Get the payment method ID
  const { data: pm } = await supabase
    .from("master_payment_methods")
    .select("id")
    .ilike("name", paymentName)
    .single()

  if (!pm) {
    return (
      <div className="space-y-4">
        <Link href="/assets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assets
          </Button>
        </Link>
        <p className="text-muted-foreground text-center py-10">
          Payment method &quot;{paymentName}&quot; not found.
        </p>
      </div>
    )
  }

  // Build query
  let query = supabase
    .from("transactions")
    .select("id, amount, description, transaction_type, transaction_date, created_by_name, master_categories ( name )")
    .eq("payment_method_id", pm.id)
    .order("transaction_date", { ascending: false })

  if (filters.from) {
    query = query.gte("transaction_date", filters.from)
  }
  if (filters.to) {
    const toDate = new Date(filters.to)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt("transaction_date", toDate.toISOString().split("T")[0])
  }

  const { data: transactions } = await query

  const incomeList = (transactions || []).filter((tx: any) => tx.transaction_type === "pemasukan")
  const expenseList = (transactions || []).filter((tx: any) => tx.transaction_type === "pengeluaran")
  const totalIncome = incomeList.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
  const totalExpense = expenseList.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
  const totalAsset = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/assets">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{paymentName}</h2>
          <p className="text-sm text-muted-foreground">Asset Detail & Transaction Report</p>
        </div>
      </div>

      <DateRangeFilter />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500 font-mono">
              +Rp {totalIncome.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{incomeList.length} transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500 font-mono">
              -Rp {totalExpense.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{expenseList.length} transaksi</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Asset</CardTitle>
            <WalletIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalAsset >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              Rp {totalAsset.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side-by-side Transaction Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
              Pemasukan
              <Badge variant="secondary" className="ml-auto">{incomeList.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeList.length > 0 ? incomeList.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell className="text-sm">{tx.description || "-"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.master_categories?.name || "-"}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-500">
                        +Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                        No income transactions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownIcon className="h-4 w-4 text-rose-500" />
              Pengeluaran
              <Badge variant="secondary" className="ml-auto">{expenseList.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseList.length > 0 ? expenseList.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell className="text-sm">{tx.description || "-"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.master_categories?.name || "-"}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-rose-500">
                        -Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                        No expense transactions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
