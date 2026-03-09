import { createClient } from "@/lib/supabase/server"
import { AssetsView } from "@/components/assets/assets-view"

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const [params, supabase] = await Promise.all([
    searchParams,
    createClient(),
  ])

  // Build query with optional date range
  let query = supabase
    .from("transactions")
    .select("amount, transaction_type, master_payment_methods ( name )")

  if (params.from) {
    query = query.gte("transaction_date", params.from)
  }
  if (params.to) {
    const toDate = new Date(params.to)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt("transaction_date", toDate.toISOString().split("T")[0])
  }

  const { data: transactions } = await query

  // Aggregate per payment method
  const paymentMap: Record<string, { income: number; expense: number }> = {}
  let totalIncome = 0
  let totalExpense = 0

  transactions?.forEach((tx: any) => {
    const name = tx.master_payment_methods?.name || "Unknown"
    if (!paymentMap[name]) paymentMap[name] = { income: 0, expense: 0 }

    const amount = Number(tx.amount)
    if (tx.transaction_type === "pemasukan") {
      paymentMap[name].income += amount
      totalIncome += amount
    } else {
      paymentMap[name].expense += amount
      totalExpense += amount
    }
  })

  const paymentAssets = Object.entries(paymentMap)
    .map(([name, { income, expense }]) => ({
      name,
      income,
      expense,
      asset: income - expense,
    }))
    .sort((a, b) => b.asset - a.asset)

  return (
    <AssetsView
      paymentAssets={paymentAssets}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      totalAsset={totalIncome - totalExpense}
    />
  )
}
