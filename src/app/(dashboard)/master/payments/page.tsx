import { createClient } from "@/lib/supabase/server"
import { PaymentsTable } from "@/components/master/payments-table"

export default async function MasterPaymentMethodsPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from("master_payment_methods")
    .select("*")
    .order("created_at", { ascending: false })

  return <PaymentsTable payments={payments || []} />
}
