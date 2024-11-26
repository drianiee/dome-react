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
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "List Karyawan",
    url: "/list-karyawan",
    icon: Inbox,
    matchPaths: ["/list-karyawan", "/karyawan/"],
  },
  {
    title: "Mutasi",
    url: "/mutasi",
    matchPaths: ["/mutasi"],
    icon: Calendar,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  // Retrieve user information from localStorage
  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
                    isActive={item.matchPaths ? item.matchPaths.some((path) => location.pathname.startsWith(path)) : location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Data and Logout Button */}
        {userData && (
          <div className="mt-auto p-4 bg-gray-100">
            <div className="text-sm font-medium text-gray-600">{userData.name}</div>
            <div className="text-xs text-gray-400">{userData.username}</div>
            <button
              onClick={handleLogout}
              className="mt-10 flex items-center w-full h-12"
            >
              <LogOut className="mr-2 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
