import { createClient } from "@/lib/supabase/server"
import { CategoriesTable } from "@/components/master/categories-table"

export default async function MasterCategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("master_categories")
    .select("*")
    .order("created_at", { ascending: false })

  return <CategoriesTable categories={categories || []} />
}
