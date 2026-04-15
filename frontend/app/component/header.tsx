"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { HiMenu, HiX, HiShoppingCart, HiUser, HiLogout } from "react-icons/hi";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/cartContext";
import { useCategory } from "../context/CategoryContext";
import Categorypanel from "../component/Categorypanel";
import QuickHealthHelp from "../component/QuickHealthHelp";

function SignInHoverLogin() {
  const { login, signup } = useUser();
  const [open, setOpen] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "user") {
      if (isLogin) {
        const success = await login(username, password);
        if (success) {
          setOpen(false);
          setUsername("");
          setPassword("");
        } else {
          setError("Invalid credentials");
        }
      } else {
        const success = await signup(username, password);
        if (success) {
          setIsLogin(true);
          setError("✅ Account created! Please login.");
          setUsername("");
          setPassword("");
        } else {
          setError("Signup failed");
        }
      }
    } else {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
        if (res.data?.role === "admin") {
          localStorage.setItem("username", res.data.username);
          localStorage.setItem("role", res.data.role);
          window.location.href = "/admin";
          return;
        }
        setError("Not authorized as admin");
      } catch (err: any) {
        if (username === "ajeet143" && password === "123456") {
          localStorage.setItem("username", username);
          localStorage.setItem("role", "admin");
          window.location.href = "/admin";
          return;
        }
        setError(err.response?.data?.message || "Admin login failed");
      }
    }

    setLoading(false);
  };

  const reset = () => {
    setIsLogin(true);
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setOpen(true);
        if (hoverTimer) clearTimeout(hoverTimer);
      }}
      onMouseLeave={() => {
        const timer = setTimeout(() => setOpen(false), 300);
        setHoverTimer(timer);
      }}
    >
      <button className="flex items-center gap-1 text-xs md:text-sm font-semibold hover:bg-green-700 px-2 py-1 rounded transition">
        <HiUser className="h-5 w-5 md:h-6 md:w-6" />
        <span className="hidden sm:inline">Sign In</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-72 z-50"
          onMouseEnter={() => {
            if (hoverTimer) clearTimeout(hoverTimer);
          }}
          onMouseLeave={() => {
            const timer = setTimeout(() => setOpen(false), 300);
            setHoverTimer(timer);
          }}
        >
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => {
                setMode("user");
                reset();
              }}
              className={`flex-1 py-2 rounded ${mode === "user" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              User
            </button>
            <button
              onClick={() => {
                setMode("admin");
                reset();
              }}
              className={`flex-1 py-2 rounded ${mode === "admin" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Admin
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-3 text-center">
            {mode === "user" ? (isLogin ? "User Login" : "Create Account") : "Admin Login"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                placeholder={mode === "user" ? "Enter user ID" : "Enter admin ID"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-slate-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder={mode === "user" ? "Enter user password" : "Enter admin password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-slate-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : mode === "user"
                ? isLogin
                  ? "Login"
                  : "Create Account"
                : "Admin Sign In"}
            </button>
          </form>

          {mode === "user" && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className="text-teal-600 hover:underline"
              >
                {isLogin ? "Create one" : "Login"}
              </button>
            </p>
          )}

          <div className="text-xs text-gray-500 mt-2 text-center">
            {mode === "user" ? (
              <>
                Demo user: <span className="font-semibold">user</span>, password: <span className="font-semibold">123</span>
              </>
            ) : (
              <>
                Admin ID: <span className="font-semibold">ajeet21</span>, password: <span className="font-semibold">12345</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useUser();
  const { cart } = useCart();
  const { selectedCategory, setSelectedCategory } = useCategory();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [username, setUsername] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    } else {
      const storedUser = localStorage.getItem("username");
      if (storedUser) setUsername(storedUser);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUsername(null);
    if (logout) logout();
    window.location.href = "/login";
  };

  const categories = [
    "Medicines",
    "Healthcare Products",
    "Medical Equipment",
    "Doctor Consultation",
    "Lab Tests & Health Packages",
    "Health Services"
  ];

  const dropdownItems: Record<string, string[]> = {
    "Medicines": [
      "Prescription Medicines",
      "OTC Medicines (Over The Counter)",
      "Ayurvedic / Homeopathic Medicines",
      "Generic Medicines"
    ],
    "Healthcare Products": [
      "Vitamins & Supplements",
      "Personal Care Items",
      "Baby Care",
      "Women Care",
      "Men’s Care"
    ],
    "Medical Equipment": [
      "Diabetes Care",
      "Fitness & Activity Monitors",
      "Health Monitors",
      "Medical Accessories",
      "Thermometers",
      "Oximeters",
      "Nebulizers"
    ],
    "Doctor Consultation": [
      "Online/Teleconsultation",
      "In-Clinic Appointment Booking",
      "Follow-Up Consultation",
      "Prescription Renewal / Second Opinion",
      "Pediatric & Family Doctor Services",
      "Mental Health & Counseling Sessions",
      "Home Visit by Doctor (On Request)"
    ],
    "Lab Tests & Health Packages": [
      "Blood Tests",
      "COVID-19 Tests",
      "Full Body Checkup",
      "Thyroid Function Test",
      "Diabetes Screening",
      "Lipid Profile",
      "Vitamin & Mineral Tests",
      "Infectious Disease Screening",
      "Allergy Testing",
    ],
    "Health Services": [
      "Doctor Consultation (Online/Teleconsultation)",
      "Pharmacist Advice",
      "Order on Call / Repeat Order",
      "Lab Tests",
      "Health Checkup Packages",
      "Book a Diagnostic Test at Home",
      "Home Healthcare",
      "Nutrition & Wellness Support"
    ]
  };

  return (
    <>
      <header className="sticky top-0 z-50 shadow-md bg-teal-700">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-3 md:p-4 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <h1 className="text-base md:text-lg font-bold">
              <Link href="/">HealthCare</Link>
            </h1>
            <div className="hidden md:flex flex-col">
              <p className="text-xs md:text-sm flex items-center">
                <img className="h-4 w-4 mr-1" src="/images/thunderbolt.png" alt="" />
                Express Delivery to
              </p>
              <button className="font-bold text-xs md:text-sm flex items-center">
                Select Pincode
                <img className="h-4 w-4 md:h-5 md:w-5 ml-1" src="/images/down.png" alt="" />
              </button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Sign In Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowLogout((prev) => !prev)}
                  className="flex items-center gap-1 text-xs md:text-sm font-semibold hover:bg-green-700 px-2 py-1 rounded transition"
                >
                  <HiUser className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="hidden sm:inline">{user.username}</span>
                </button>
                {showLogout && (
                  <button
                    onClick={handleLogout}
                    className="absolute right-0 mt-2 bg-red-500 px-3 py-2 rounded text-white text-sm hover:bg-red-600 whitespace-nowrap flex items-center gap-2"
                  >
                    <HiLogout className="h-4 w-4" /> Logout
                  </button>
                )}
              </div>
            ) : (
              <SignInHoverLogin />
            )}


            {/* Cart Link */}
            <Link href="/cart" className="flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-green-700 transition relative">
              <HiShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden sm:inline">{cartCount}</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-green-700 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>

            {/* Category Panel Toggle
            <button
              className="md:hidden p-2 rounded-md hover:bg-green-700 transition text-sm"
              onClick={() => setIsOpenCatPanel(true)}
            >
              Categories
            </button> */}
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        <nav className="hidden md:block bg-teal-700 text-white border-t">
          <ul className="flex justify-around items-center p-3 text-sm font-medium ">
            <li>
              <Link href="/" className="hover:text-secondary transition px-3 py-2">
                All Products
              </Link>
            </li>
            {Object.keys(dropdownItems).map((menu) => (
              <li key={menu} className="relative group">
                <Link href={`/?category=${encodeURIComponent(menu)}`} className="hover:text-secondary transition px-3 py-2">
                  {menu}
                </Link>
                <ul className="absolute left-0 mt-0 bg-white border text-black rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 min-w-[180px]">
                  {dropdownItems[menu].map((item: string) => (
                    <li key={item}>
                      <Link href={`/?category=${encodeURIComponent(item)}`} className="block px-4 py-2 hover:bg-gray-100 hover:text-secondary">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}

            <li className="hover:text-teal-600 transition px-3 py-2">Doctor Consult</li>
            <li className="hover:text-teal-600 transition px-3 py-2">Order on Call</li>
            <li>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="hover:text-teal-600 transition px-3 py-2"
              >
                Quick Health Help
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu - Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-teal-700 text-white border-t">
            <ul className="flex flex-col p-3 space-y-2 text-sm">
              <li>
                <button
                  className="w-full text-left hover:text-secondary transition px-2 py-2"
                  onClick={() => {
                    setIsOpenCatPanel(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Pharmacy Services ▼
                </button>
              </li>

              {Object.keys(dropdownItems).map((menu) => (
                <li key={menu}>
                  <details className="cursor-pointer">
                    <summary className="hover:text-secondary transition px-2 py-2">
                      {menu}
                    </summary>
                    <ul className="pl-4 space-y-1 mt-2 border-l-2 border-gray-300">
                      {dropdownItems[menu].map((item: string) => (
                        <li key={item}>
                          <a href="#" className="block px-2 py-1 hover:text-secondary text-xs">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}

              <li className="px-2 py-2 hover:text-secondary transition">Doctor Consult</li>
              <li className="px-2 py-2 hover:text-secondary transition">Order on Call</li>
              <li className="px-2 py-2 hover:text-secondary transition">
                <button onClick={() => { setIsHelpOpen(true); setMobileMenuOpen(false); }} className="w-full text-left">
                  💊 Quick Health Help
                </button>
              </li>

              {/* Mobile Admin Link */}
              <li className="px-2 py-2 hover:text-teal-600 transition sm:hidden">
                <Link href="/admin">Admin</Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Quick Health Help Modal */}
      <QuickHealthHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Category Panel */}
      <Categorypanel
        isOpenCartPanel={isOpenCatPanel}
        setIsOpenCartPanel={setIsOpenCatPanel}
      />
    </>
  );
}
