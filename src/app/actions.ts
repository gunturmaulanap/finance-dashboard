"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addCategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const type = formData.get("type") as string

  if (!name || !type) return { error: "Name and type are required." }

  const { error } = await supabase.from("master_categories").insert({ name, type })
  if (error) return { error: error.message }

  revalidatePath("/master/categories")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("master_categories").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/master/categories")
  return { success: true }
}

export async function addPaymentMethod(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string

  if (!name) return { error: "Name is required." }

  const { error } = await supabase.from("master_payment_methods").insert({ name })
  if (error) return { error: error.message }

  revalidatePath("/master/payments")
  return { success: true }
}

export async function deletePaymentMethod(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("master_payment_methods").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/master/payments")
  return { success: true }
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const amount = Number(formData.get("amount"))
  const description = formData.get("description") as string
  const transaction_type = formData.get("transaction_type") as string
  const category_id = formData.get("category_id") as string
  const payment_method_id = formData.get("payment_method_id") as string
  const rawDate = formData.get("transaction_date") as string
  const transaction_date = rawDate && rawDate.length > 0 ? rawDate : new Date().toISOString()
  const created_by_name = (formData.get("created_by_name") as string) || "Web Dashboard"

  if (!amount || !transaction_type || !category_id || !payment_method_id) {
    return { error: "All fields are required." }
  }

  const { error } = await supabase.from("transactions").insert({
    amount,
    description,
    transaction_type,
    category_id,
    payment_method_id,
    transaction_date,
    created_by_name,
  })

  if (error) return { error: error.message }

  revalidatePath("/transactions")
  revalidatePath("/")
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()

  // Check current user role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated." }

  const { data: roleData } = await supabase
    .from("users_role")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!roleData || roleData.role !== "superadmin") {
    return { error: "Only superadmin can delete transactions." }
  }

  const { error } = await supabase.from("transactions").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/transactions")
  revalidatePath("/")
  return { success: true }
}

export async function addUser(email: string, password: string, role: string) {
  const supabase = await createClient()

  // Create user in Supabase Auth using admin API
  const { createClient: createAdminClient } = await import("@supabase/supabase-js")
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return { error: authError.message }

  // Insert role
  const { error: roleError } = await adminSupabase.from("users_role").insert({
    user_id: authData.user.id,
    role,
  })

  if (roleError) return { error: roleError.message }

  revalidatePath("/master/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const { createClient: createAdminClient } = await import("@supabase/supabase-js")
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Delete from users_role first
  await adminSupabase.from("users_role").delete().eq("user_id", userId)

  // Delete from auth
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath("/master/users")
  return { success: true }
}
