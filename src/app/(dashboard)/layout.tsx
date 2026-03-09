import { AppSidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { createClient } from "@/lib/supabase/server"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar email={data.user?.email} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
