"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { HiMenu, HiX, HiHome, HiShoppingCart, HiBell, HiUser, HiLogout, HiCog, HiChartBar , HiPlus, HiPencil, HiTrash, HiCheck, HiX as HiXIcon } from "react-icons/hi";
import { API_BASE_URL, SOCKET_URL, normalizeBackendUrl } from "../lib/backend";
import { firebaseAuth } from "../lib/firebase";
import { isAdminFromToken, toAuthEmail } from "../lib/firebaseAuthHelpers";

// Types
type Product = { _id: string; title: string; description: string; amount: number; image: string; category: string; stock?: number; discount?: number; createdAt?: string };
type LabTest = { _id: string; name: string; healthConcern: string; price: number; image?: string; createdAt?: string };
type Order = {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { title: string; qty: number; price: number }[];
  totalAmount: number;
  status: "Pending" | "Accepted" | "Delivered" | "Rejected";
  createdAt?: string;
};

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
        <Icon size={32} color={color} />
      </div>
    </div>
  </div>
);

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }: any) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: HiHome },
    { id: "orders", label: "Orders", icon: HiShoppingCart },
    { id: "products", label: "Products", icon: HiChartBar },
    { id: "lab-tests", label: "Lab Tests", icon: HiBell },
    { id: "settings", label: "Settings", icon: HiCog },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-teal-700 to-teal-800 text-white transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Healthcare Admin</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white text-teal-700 font-semibold"
                    : "text-teal-100 hover:bg-teal-600"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

// Navbar Component
const Navbar = ({ isSidebarOpen, setIsSidebarOpen, onLogout, adminName }: any) => (
  <nav className="bg-white shadow-lg border-b border-gray-200">
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden text-teal-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
        <h1 className="text-xl font-bold text-gray-900 hidden md:block">Healthcare Dashboard</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden sm:block">
          <input
            type="text"
            placeholder="Search orders, products..."
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-gray-600 hover:text-teal-700 transition-colors">
          <HiBell size={24} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </button>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{adminName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-red-600 transition-colors"
        >
          <HiLogout size={24} />
        </button>
      </div>
    </div>
  </nav>
);

// Main Dashboard Component
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Form states
  const [newProduct, setNewProduct] = useState({ title: "", description: "", amount: "", image: "", category: "" });
  const [productSearch, setProductSearch] = useState("");

  const API_URL = `${API_BASE_URL}/products`;
  const LABTEST_URL = `${API_BASE_URL}/lab-tests`;
  const ORDER_URL = `${API_BASE_URL}/orders`;
  const UPLOAD_URL = `${API_BASE_URL}/upload`;

  // Normalize image paths
  const normalizeImage = (img?: string | null) => {
    return normalizeBackendUrl(img);
  };

  // Login handler
  const handleLogin = async () => {
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const email = toAuthEmail(credentials.id);
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, credentials.password);
      const token = await credential.user.getIdTokenResult();

      if (!isAdminFromToken(token.claims as Record<string, unknown>, credential.user.email)) {
        await signOut(firebaseAuth);
        setLoginError("Not authorized as admin");
        return;
      }

      localStorage.setItem("username", credentials.id);
      localStorage.setItem("role", "admin");
      localStorage.setItem("adminLoggedIn", "true");
      setIsLoggedIn(true);
    } catch (err: any) {
      setLoginError(err?.message || "Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch functions
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLabTests = async () => {
    try {
      const res = await axios.get(LABTEST_URL);
      setLabTests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get<Order[]>(ORDER_URL);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
      fetchLabTests();
      fetchOrders();
    }
  }, [isLoggedIn]);

  // Socket connection
  useEffect(() => {
    if (!isLoggedIn) return;
    const s = io(SOCKET_URL);
    setSocket(s);
    s.on("product-updated", fetchProducts);
    s.on("labtest-updated", fetchLabTests);
    s.on("order-updated", fetchOrders);
    return () => s.disconnect();
  }, [isLoggedIn]);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Healthcare Admin</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Admin ID"
              value={credentials.id}
              onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-lg font-semibold transition-all duration-200"
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
            {loginError && <p className="text-center text-sm text-red-600">{loginError}</p>}
            <p className="text-center text-sm text-gray-600 mt-4">
              Use your Firebase admin account credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onLogout={async () => {
            await signOut(firebaseAuth);
            setIsLoggedIn(false);
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
          }}
          adminName="Ajeet Gautam"
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's your business overview.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={HiShoppingCart} label="Total Orders" value={orders.length} color="#0F766E" />
                <StatsCard icon={HiChartBar} label="Products" value={products.length} color="#22C55E" />
                <StatsCard icon={HiBell} label="Lab Tests" value={labTests.length} color="#2563EB" />
                <StatsCard icon={HiUser} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="#F59E0B" />
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} items</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{order.totalAmount}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                              order.status === "Accepted" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                <div className="text-sm text-gray-600">
                  Pending: <span className="font-bold text-orange-600">{pendingOrders}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customerPhone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.items.length}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{order.totalAmount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "Accepted" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm flex gap-2">
                          {order.status === "Pending" && (
                            <>
                              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                <HiCheck size={14} /> Accept
                              </button>
                              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                <HiXIcon size={14} /> Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                  <HiPlus size={20} /> Add Product
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                      <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden h-48">
                        {product.image && (
                          <Image
                            src={normalizeImage(product.image) || "/images/medicine.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{product.description?.substring(0, 50)}...</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-teal-600">₹{product.amount}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{product.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <HiPencil size={16} /> Edit
                        </button>
                        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <HiTrash size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lab Tests Tab */}
          {activeTab === "lab-tests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Lab Tests Management</h1>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                  <HiPlus size={20} /> Add Test
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labTests.map((test) => (
                  <div key={test._id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                    <div className="mb-4 bg-gray-100 rounded-lg h-40 flex items-center justify-center">
                      {test.image && (
                        <Image
                          src={normalizeImage(test.image) || "/images/blood-sample.jpg"}
                          alt={test.name}
                          width={150}
                          height={150}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{test.healthConcern}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-teal-600">₹{test.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                        <HiPencil size={16} /> Edit
                      </button>
                      <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                        <HiTrash size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <p className="text-gray-600">Settings page coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
