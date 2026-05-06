"use client"; // 🔹 important


// 2---   // backend path required when host the website on server  

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";
import { toAuthEmail } from "../lib/firebaseAuthHelpers";

type User = { username: string; role: string; email?: string };
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
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem("user");
        return;
      }

      const storedRole = localStorage.getItem("role") || "user";
      const username =
        localStorage.getItem("username") ||
        firebaseUser.email?.split("@")[0] ||
        firebaseUser.uid;

      const userData = { username, role: storedRole, email: firebaseUser.email || undefined };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("username", username);
      localStorage.setItem("role", storedRole);
    });

    return () => unsubscribe();
  }, []);

    // backend path required when host the website on server  


  const login = async (username: string, password: string) => {
    try {
      const email = toAuthEmail(username);
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const nextUser = {
        username,
        role: "user",
        email: credential.user.email || undefined,
      };
      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      localStorage.setItem("username", username);
      localStorage.setItem("role", "user");
      return true;
    } catch (error: any) {
      alert(error?.message || "Invalid credentials");
      return false;
    }
  };


    // backend path required when host the website on server  


  const signup = async (username: string, password: string, role = "user") => {
    try {
      const email = toAuthEmail(username);
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      return true;
    } catch (error: any) {
      alert(error?.message || "Signup failed");
      return false;
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  return <UserContext.Provider value={{ user, login, signup, logout }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
