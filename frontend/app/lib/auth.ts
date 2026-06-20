import axios from "axios";
import { API_BASE_URL } from "./backend";

export type AuthRole = "admin" | "user";

export type AuthUser = {
  username: string;
  role: AuthRole;
  email?: string;
};

type AuthResponse = {
  user?: AuthUser;
  message?: string;
};

const AUTH_URL = `${API_BASE_URL}/auth`;

export const loginWithBackend = async (username: string, password: string) => {
  const response = await axios.post<AuthResponse>(`${AUTH_URL}/login`, { username, password });
  return response.data.user ?? null;
};

export const signupWithBackend = async (username: string, password: string, role: AuthRole = "user") => {
  const response = await axios.post<AuthResponse>(`${AUTH_URL}/signup`, { username, password, role });
  return response.data.user ?? null;
};

export const getStoredAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem("user");
    }
  }

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  if (!username || (role !== "admin" && role !== "user")) return null;

  return { username, role };
};

export const storeAuthUser = (user: AuthUser) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("username", user.username);
  localStorage.setItem("role", user.role);

  if (user.role === "admin") {
    localStorage.setItem("adminLoggedIn", "true");
  } else {
    localStorage.removeItem("adminLoggedIn");
  }
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("adminLoggedIn");
};