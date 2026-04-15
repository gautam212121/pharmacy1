"use client"; // 🔹 important


// 2---   // backend path required when host the website on server  

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = { username: string; role: string };
type UserContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if window exists (client-side)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    }
  }, []);

    // backend path required when host the website on server  


  const login = async (username: string, password: string) => {
    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser({ username: data.username, role: data.role });
      localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));
      localStorage.setItem("role", data.role);
      return true;
    }
    alert(data.message);
    return false;
  };


    // backend path required when host the website on server  


  const signup = async (username: string, password: string, role = "user") => {
    const res = await fetch("http://localhost:5001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      return true;
    }
    alert(data.message);
    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  };

  return <UserContext.Provider value={{ user, login, signup, logout }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
