"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { clearAuthSession, getStoredAuthUser, loginWithBackend, signupWithBackend, storeAuthUser, type AuthUser } from "../lib/auth";

type User = AuthUser;
type UserContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredAuthUser());
  }, []);


  const login = async (username: string, password: string) => {
    try {
      const nextUser = await loginWithBackend(username, password);
      if (!nextUser) return false;

      if (nextUser.role !== "user") {
        setUser(null);
        clearAuthSession();
        alert("Use the admin login for admin accounts");
        return false;
      }

      setUser(nextUser);
      storeAuthUser(nextUser);
      return true;
    } catch (error: any) {
      alert(error?.message || "Invalid credentials");
      return false;
    }
  };


  const signup = async (username: string, password: string, role = "user") => {
    try {
      const nextUser = await signupWithBackend(username, password, role as AuthUser["role"]);
      if (!nextUser) return false;

      setUser(nextUser);
      storeAuthUser(nextUser);
      return true;
    } catch (error: any) {
      alert(error?.message || "Signup failed");
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    clearAuthSession();
  };

  return <UserContext.Provider value={{ user, login, signup, logout }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
