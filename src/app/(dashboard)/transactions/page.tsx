import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { DateRangeFilter } from "@/components/date-range-filter"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with optional date range filters
  let query = supabase
    .from("transactions")
    .select(`
      *,
      master_categories ( name ),
      master_payment_methods ( name )
    `)
    .order("transaction_date", { ascending: false })

  if (params.from) {
    query = query.gte("transaction_date", params.from)
  }
  if (params.to) {
    const toDate = new Date(params.to)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt("transaction_date", toDate.toISOString().split("T")[0])
  }

  const { data: transactions } = await query

  const { data: categories } = await supabase
    .from("master_categories")
    .select("id, name, type")
    .order("name")

  const { data: payments } = await supabase
    .from("master_payment_methods")
    .select("id, name")
    .order("name")

  // Fetch current user role
  const { data: { user } } = await supabase.auth.getUser()
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
