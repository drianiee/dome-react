import {Home, Inbox, LogOut, User, List } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import LogoTelkom from "../assets/LogoTelkom.png";

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
    <div className="top-0 left-0 h-screen w-64 bg-white shadow-md flex flex-col z-50">
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6">
        <img
          src={LogoTelkom}
          alt="Logo Telkom"
          className="h-12"
        />
        <h1 className="ml-2 text-xl font-bold text-black">Dome</h1>
      </div>

      {/* Menu Items */}
      <div className="flex-grow">
        <nav className="mt-4 space-y-2 px-4">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              location.pathname === "/dashboard" ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          {/* List Karyawan */}
          <Link
            to="/list-karyawan"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              location.pathname === "/list-karyawan" ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <List className="w-5 h-5 mr-3" />
            List Karyawan
          </Link>

          {/* Mutasi */}
          <Link
            to="/mutasi"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              location.pathname === "/mutasi" ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <Inbox className="w-5 h-5 mr-3" />
            Mutasi
          </Link>

          {/* Penilaian */}
          <Link
            to="/penilaian"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              location.pathname === "/profile" ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            Penilaian
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full h-12 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}
