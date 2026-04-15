"use client";

import { useState } from "react";
import axios from "axios";

export default function AdminHoverLogin() {
  const [open, setOpen] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setLoading(true);

    const fallbackAdmin = username === "ajeet143" && password === "123456";
    
//   // backend path required when host the website on server  

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      if (res.data?.role === "admin") {
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("role", res.data.role);
        window.location.href = "/admin";
        return;
      }
      // If server returns a valid user but not admin, still allow the known admin credentials.
      if (fallbackAdmin || (username === "ajeet21" && password === "12345")) {
        localStorage.setItem("username", username);
        localStorage.setItem("role", "admin");
        window.location.href = "/admin";
        return;
      }
      setError("Not authorized as admin");
    } catch (err: any) {
      // connection issue or server down - allow fallback hardcoded credentials
      if (fallbackAdmin || (username === "ajeet21" && password === "12345")) {
        localStorage.setItem("username", username);
        localStorage.setItem("role", "admin");
        window.location.href = "/admin";
        return;
      }
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setOpen(true);
        if (hoverTimer) clearTimeout(hoverTimer);
      }}
      onMouseLeave={() => {
        // start 2s timer to close
        const t = setTimeout(() => setOpen(false), 200);
        setHoverTimer(t);
      }}
    >
      <button className="text-sm px-2 py-1 rounded hover:bg-teal-500 transition flex items-center gap-1">
        Admin
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg p-4 z-50">
          <h4 className="font-semibold mb-2">Admin Login</h4>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2 bg-slate-100 text-black placeholder:text-black"
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-3 bg-slate-100 text-black placeholder:text-black"
              autoComplete="current-password"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 w-20% bg-blue-600 text-white px-3 py-2 rounded">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
