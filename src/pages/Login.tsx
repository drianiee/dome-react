import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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

      // Save token and role to localStorage
      localStorage.setItem("token", data.token);

      // Ensure the role is saved correctly
      localStorage.setItem("role", data.user.id_roles.toString()); // Save user's role correctly

      // Debugging: Check the role and log it
      const userRole = localStorage.getItem("role");
      console.log("User role from localStorage:", userRole);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 rounded-md shadow-md bg-white">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Login</h1>
        
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
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
