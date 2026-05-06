"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function AuthPage() {
  const { login, signup } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
//  // backend path required when host the website on server  

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const success = await login(username, password);
        if (success) {
          router.push("/");
          return;
        }
        setError("Invalid credentials");
      } else {
        const success = await signup(username, password);
        if (success) {
          setIsLogin(true);
          setError("✅ Account created! Please login.");
          return;
        }
        setError("Signup failed");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-teal-600 p-8 text-white text-center">
          <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3">Welcome Back</p>
          <h1 className="text-3xl font-bold">{isLogin ? "Sign In" : "Create Account"}</h1>
          <p className="mt-2 text-slate-100 text-sm">Access your pharmacy dashboard and manage orders easily.</p>
        </div>

        <div className="p-8 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              autoComplete="username"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              autoComplete="current-password"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-teal-600 text-white py-3 font-semibold shadow-lg shadow-teal-200/40 hover:bg-teal-700 transition"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>

          <div className="text-center text-sm text-slate-600">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              {isLogin ? "Create an account" : "Login instead"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Demo credentials</p>
            <p className="mt-2">User: <span className="font-medium">user</span></p>
            <p>Pass: <span className="font-medium">123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
