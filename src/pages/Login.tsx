import React, { useState } from "react";
import { jwtDecode } from "jwt-decode"; // Gunakan ekspor bernama jika ada masalah default
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "../assets/Background.mp4";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      const response = await fetch("https://dome-backend-5uxq.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed! Invalid username or password.");
      }

      const data = await response.json();

      // Save token to localStorage
      localStorage.setItem("token", data.token);

      // Decode token to get user data
      const decodedToken: any = jwtDecode(data.token);
      const { username, name, id_roles } = decodedToken;

      // Console log the decoded user data
      // console.log("Username:", username);
      // console.log("Name:", name);
      // console.log("Role ID:", id_roles);

      // Save decoded user data to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ username, name, id_roles })
      );

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={BackgroundVideo}
        autoPlay
        loop
        muted
      />
      <div className="relative z-10 w-full max-w-md p-6 rounded-md shadow-md bg-white">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Telkom DOME</h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              placeholder="Enter your email"
              className="mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="mt-2"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[#CF3C3C]">
            Login
          </Button>
        </form>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90"></div>
    </div>
  );
};

export default Login;
