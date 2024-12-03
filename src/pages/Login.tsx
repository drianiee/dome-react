import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import BackgroundVideo from "../assets/Background.mp4"; // Import video file

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null); // To handle error messages

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      const response = await fetch("http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/login", {
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
      console.log("Login successful:", data);

      // Save token and user information to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.id_roles.toString()); // Save user's role
      localStorage.setItem(
        "user",
        JSON.stringify({ name: data.user.name, username: data.user.username })
      ); // Store name and username

      // Debugging: Check the role and log it
      const userRole = localStorage.getItem("role");
      console.log("User role from localStorage:", userRole);

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={BackgroundVideo}
        autoPlay
        loop
        muted
      />

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md p-6 rounded-md shadow-md bg-white">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Telkom DOME</h1>

        {/* Display error message if any */}
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

      {/* Overlay for darkening background if needed */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90"></div>
    </div>
  );
};

export default Login;
