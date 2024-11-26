import { SidebarProvider } from "@/components/ui/sidebar"
// import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow">
      {/* <SidebarTrigger /> */}
        {children}
      </main>
    </SidebarProvider>
  )
}
