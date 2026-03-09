import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { DateRangeFilter } from "@/components/date-range-filter"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const [params, supabase] = await Promise.all([
    searchParams,
    createClient(),
  ])

  // Build transactions query
  let txQuery = supabase
    .from("transactions")
    .select(`
      *,
      master_categories ( name ),
      master_payment_methods ( name )
    `)
    .order("transaction_date", { ascending: false })

  if (params.from) {
    txQuery = txQuery.gte("transaction_date", params.from)
  }
  if (params.to) {
    const toDate = new Date(params.to)
    toDate.setDate(toDate.getDate() + 1)
    txQuery = txQuery.lt("transaction_date", toDate.toISOString().split("T")[0])
  }

  // Run ALL queries in parallel instead of sequentially
  const [
    { data: transactions },
    { data: categories },
    { data: payments },
    { data: { user } },
  ] = await Promise.all([
    txQuery,
    supabase.from("master_categories").select("id, name, type").order("name"),
    supabase.from("master_payment_methods").select("id, name").order("name"),
    supabase.auth.getUser(),
  ])

  // Get user role (needs user.id from above)
  let userRole = "viewer"
  if (user) {
    const { data: roleData } = await supabase
      .from("users_role")
      .select("role")
      .eq("user_id", user.id)
      .single()
    if (roleData) userRole = roleData.role
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <TransactionsTable
          transactions={(transactions as any) || []}
          categories={categories || []}
          payments={payments || []}
          dateFilter={<DateRangeFilter />}
          userRole={userRole}
        />
      </Suspense>
    </div>
  )
}
