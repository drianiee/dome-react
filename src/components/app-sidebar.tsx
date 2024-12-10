import { useState } from "react";
import { Home, Inbox, LogOut, User, List } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import LogoTelkom from "../assets/LogoTelkom.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;
  const role = localStorage.getItem("role"); // Ambil role dari localStorage
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const roleMapping: { [key: string]: string } = {
    "1": "Admin HC TREG",
    "2": "Admin ISH",
    "3": "Admin Witel",
    "4": "Admin Atasan Outsource",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (basePath: string) => location.pathname.startsWith(basePath);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Ambil token dari localStorage
      const response = await axios.post(
        "https://dome-backend-5uxq.onrender.com/change-password",
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Tambahkan token dalam header
          },
        }
      );
  
      if (response.status === 200) {
        setChangePasswordSuccess(true);
        setOldPassword("");
        setNewPassword("");
        // alert("Password changed successfully!");
      }
    } catch (error: any) {
      setChangePasswordSuccess(false);
      const errorMessage =
        error.response?.data?.message || "An error occurred during password change.";
      alert("Error changing password: " + errorMessage);
    }
  };
  

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md flex flex-col z-50">
      {/* Logo Section */}
      <div className="flex items-center px-8 py-6">
        <img src={LogoTelkom} alt="Logo Telkom" className="h-8" />
        <h1 className="ml-2 text-xl font-bold text-black">Dome</h1>
      </div>
      <button onClick={() => setIsDialogOpen(true)} className="mt-auto px-8 py-4">
        {userData && (
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">{userData.name}</div>
            {role && <div className="text-xs text-gray-700">{roleMapping[role] || "Unknown Role"}</div>}
            <div className="text-xs text-gray-700">{userData.username}</div>
          </div>
        )}
      </button>
      <hr className="h-px bg-gray-300 border-1" />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Detail</DialogTitle>
          </DialogHeader>
          {userData && (
            <form className="space-y-4" onSubmit={handlePasswordChange}>
              <div className="text-left  space-y-4">
                <div className="text-base font-medium text-gray-700">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={userData.name}
                    readOnly
                    tabIndex={-1}
                    className="block w-full mt-1 p-2 border border-gray-300 rounded-md cursor-default bg-gray-100 focus:outline-none"
                  />
                </div>
                {role && (
                  <div className="text-sm text-gray-700">
                    <label htmlFor="role">Role:</label>
                    <input
                      type="text"
                      id="role"
                      value={roleMapping[role] || "Unknown Role"}
                      readOnly
                      tabIndex={-1}
                      className="block w-full mt-1 p-2 border border-gray-300 rounded-md cursor-default bg-gray-100 focus:outline-none"
                    />
                  </div>
                )}
                <div className="text-sm text-gray-700">
                  <label htmlFor="username">Email:</label>
                  <input
                    type="email"
                    id="username"
                    value={userData.username}
                    readOnly
                    tabIndex={-1}
                    className="block w-full mt-1 p-2 border border-gray-300 rounded-md cursor-default bg-gray-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="border-t border-gray-300"></div>
              <div className="text-sm text-gray-700">
                <label htmlFor="oldPassword">Old Password:</label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="text-sm text-gray-700">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-[#CF3C3C] text-white py-2 px-4 rounded-md hover:bg-red-800"
              >
                Change Password
              </button>
              {changePasswordSuccess && (
                <p className="text-green-500 text-sm mt-2">
                  Password changed successfully!
                </p>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Menu Items */}
      <div className="flex-grow">
        <nav className="mt-4 space-y-2 px-4">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              isActive("/dashboard") ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/list-karyawan"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              isActive("/list-karyawan") ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <List className="w-5 h-5 mr-3" />
            List Karyawan
          </Link>
          <Link
            to="/mutasi"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              isActive("/mutasi") ? "bg-[#CF3C3C] text-white" : "text-gray-500"
            }`}
          >
            <Inbox className="w-5 h-5 mr-3" />
            Mutasi
          </Link>
          {parseInt(localStorage.getItem("role") || "0", 10) === 2 && (
            <Link
              to="/penilaian"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                isActive("/penilaian") ? "bg-[#CF3C3C] text-white" : "text-gray-500"
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              Penilaian
            </Link>
          )}
          {/* <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button> */}
        </nav>
      </div>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full h-12 border border-[#CF3C3C] text-[#CF3C3C] rounded-lg hover:bg-[#CF3C3C] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}
