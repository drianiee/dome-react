import { Calendar, Home, Inbox, LogOut } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard", // Path ke halaman Dashboard
    icon: Home,
  },
  {
    title: "List Karyawan",
    url: "/list-karyawan", // Path ke halaman List Karyawan
    icon: Inbox,
    // Tambahkan kondisi aktif untuk Detail Karyawan juga
    matchPaths: ["/list-karyawan", "/karyawan/"], // Semua URL yang cocok untuk aktif
  },
  {
    title: "Mutasi",
    url: "/mutasi", // Path ke halaman Mutasi
    matchPaths: ["/mutasi"],
    icon: Calendar,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Digunakan untuk mengetahui path URL saat ini

  const handleLogout = () => {
    // Hapus token atau data autentikasi lainnya
    localStorage.removeItem("token");

    // Redirect ke halaman login
    navigate("/");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.matchPaths
                        ? item.matchPaths.some((path) =>
                            location.pathname.startsWith(path)
                          ) // Cek jika path cocok
                        : location.pathname === item.url
                    } // Tandai menu aktif
                  >
                    {/* Gunakan Link dari react-router-dom */}
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
