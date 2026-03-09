import { createClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/master/users-table"

export default async function MasterUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("users_role")
    .select("user_id, role")
    .order("created_at", { ascending: false })

  return <UsersTable users={users || []} />
}
