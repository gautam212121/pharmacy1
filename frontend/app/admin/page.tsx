"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL, normalizeBackendUrl } from "../lib/backend";
import { clearAuthSession, loginWithBackend, storeAuthUser } from "../lib/auth";
import { HiMenu, HiX, HiHome, HiShoppingCart, HiBell, HiUser, HiLogout, HiCog, HiChartBar, HiPlus, HiPencil, HiTrash, HiCheck, HiX as HiXIcon } from "react-icons/hi";

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
  orderType?: "product" | "lab-test" | "doctor-consultation";
  testType?: string;
  doctorType?: string;
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
    { id: "doctor-consult", label: "Doctor Consult", icon: HiUser },
    { id: "analytics", label: "Analytics", icon: HiChartBar },
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
          <h2 className="text-2xl font-bold mb-8">🏥 Healthcare</h2>
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
                    ? "bg-white text-teal-700 font-semibold shadow-lg"
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

const normalizeImage = (img?: string | null) => {
  return normalizeBackendUrl(img);
};

const getOrderType = (order: Order) => {
  if (order.orderType) return order.orderType;

  const itemTitle = order.items?.[0]?.title?.toLowerCase() || "";
  if (order.doctorType || itemTitle.includes("appointment")) return "doctor-consultation";
  if (order.testType || itemTitle.includes("test")) return "lab-test";
  return "product";
};

// Add Product Modal Component
const AddProductModal = ({ isOpen, onClose, onSubmit, form, setForm, categories, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, handleImageUpload, isEditing }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{isEditing ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} title="Close product modal" aria-label="Close product modal" className="text-white hover:bg-teal-600 p-2 rounded-lg transition-colors">
            <HiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title *</label>
            <input
              type="text"
              value={form.title}
              title="Product title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter product title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              value={form.description}
              title="Product description"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Main Category *</label>
              <select
                value={selectedCategory}
                title="Select main category"
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Category</option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory *</label>
              <select
                value={selectedSubcategory}
                title="Select subcategory"
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              >
                <option value="">Select Subcategory</option>
                {selectedCategory && categories[selectedCategory]?.map((subcat: string) => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Stock, Discount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                value={form.amount}
                title="Product price"
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Enter price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                title="Stock quantity"
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                value={form.discount}
                title="Discount percentage"
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image *</label>
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                title="Upload product image"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {(form.preview || form.image) && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={form.preview || normalizeImage(form.image) || "/images/medicine.jpg"}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onSubmit}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <HiCheck size={20} /> {isEditing ? "Update Product" : "Add Product"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ isSidebarOpen, setIsSidebarOpen, onLogout, adminName }: any) => (
  <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-20">
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

        {/* Profile */}
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
          title="Logout"
          aria-label="Logout"
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('adminLoggedIn') === 'true';
    return false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productOrders, setProductOrders] = useState<Order[]>([]);
  const [labTestOrders, setLabTestOrders] = useState<Order[]>([]);
  const [doctorOrders, setDoctorOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    amount: "",
    stock: "",
    discount: "",
    image: "",
    preview: null as string | null,
  });

  // Category structure
  const categories = {
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
      "Men's Care"
    ],
    "Medical Equipment": [
      "Diabetes Care",
      "Fitness & Activity Monitors",
      "Health Monitors",
      "Medical Accessories",
      "Thermometers",
      "Oximeters",
      "Nebulizers"
    ]
  };

  const findCategoryBySubcategory = (subcategory: string) => {
    const entry = Object.entries(categories).find(([, subcats]) => subcats.includes(subcategory));
    return entry ? entry[0] : "";
  };

  const resetProductForm = () => {
    setProductForm({ title: "", description: "", amount: "", stock: "", discount: "", image: "", preview: null });
    setSelectedCategory("");
    setSelectedSubcategory("");
    setEditingProductId(null);
  };

  const API_URL = `${API_BASE_URL}/products`;
  const LABTEST_URL = `${API_BASE_URL}/lab-tests`;
  const ORDER_URL = `${API_BASE_URL}/orders`;

  // Login handler
  const handleLogin = async () => {
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const user = await loginWithBackend(credentials.id, credentials.password);

      if (!user) {
        setLoginError("Invalid credentials");
        return;
      }

      if (user.role !== "admin") {
        setLoginError("Not authorized as admin");
        return;
      }

      storeAuthUser(user);
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

  // Image Upload Handler
  const handleImageUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setProductForm(prev => ({ ...prev, preview: previewUrl }));

    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const normalizedUrl = normalizeImage(res.data.imageUrl) || res.data.imageUrl;
      setProductForm(prev => ({ ...prev, image: normalizedUrl }));
    } catch (err: any) {
      alert("Image upload failed: " + err.message);
    }
  };

  // Add Product Handler
  const handleAddProduct = async () => {
    if (!productForm.title || !productForm.description || !productForm.amount || !productForm.image || !selectedCategory || !selectedSubcategory) {
      alert("Please fill all fields and select category & subcategory");
      return;
    }

    try {
      const res = await axios.post(API_URL, {
        title: productForm.title,
        description: productForm.description,
        amount: Number(productForm.amount),
        stock: Number(productForm.stock) || 0,
        discount: Number(productForm.discount) || 0,
        image: productForm.image,
        category: selectedSubcategory
      });
      setProducts(prev => [res.data, ...prev]);
      resetProductForm();
      setShowAddProductModal(false);
      socket?.emit("product-updated");
    } catch (err: any) {
      alert("Failed to add product: " + err.message);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;
    if (!productForm.title || !productForm.description || !productForm.amount || !productForm.image || !selectedCategory || !selectedSubcategory) {
      alert("Please fill all fields and select category & subcategory");
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/${editingProductId}`, {
        title: productForm.title,
        description: productForm.description,
        amount: Number(productForm.amount),
        stock: Number(productForm.stock) || 0,
        discount: Number(productForm.discount) || 0,
        image: productForm.image,
        category: selectedSubcategory
      });
      setProducts(prev => prev.map((p) => (p._id === res.data._id ? res.data : p)));
      resetProductForm();
      setShowAddProductModal(false);
      socket?.emit("product-updated");
    } catch (err: any) {
      alert("Failed to update product: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      socket?.emit("product-updated");
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    }
  };

  const handleAcceptOrder = async (id: string) => {
    try {
      const res = await axios.put(`${ORDER_URL}/${id}`, { status: "Accepted" });
      setOrders(prev => prev.map(o => o._id === id ? res.data : o));
      socket?.emit("order-updated");
    } catch (err: any) {
      alert("Failed to accept order: " + err.message);
    }
  };

  const handleRejectOrder = async (id: string) => {
    if (!confirm("Are you sure you want to reject this order?")) return;
    try {
      await axios.delete(`${ORDER_URL}/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
      socket?.emit("order-updated");
    } catch (err: any) {
      alert("Failed to reject order: " + err.message);
    }
  };

  const handleEditProduct = (product: Product) => {
    const category = findCategoryBySubcategory(product.category);
    setSelectedCategory(category);
    setSelectedSubcategory(product.category);
    setProductForm({
      title: product.title,
      description: product.description,
      amount: String(product.amount),
      stock: String(product.stock || 0),
      discount: String(product.discount || 0),
      image: product.image || "",
      preview: normalizeImage(product.image) || null,
    });
    setEditingProductId(product._id);
    setShowAddProductModal(true);
  };

  const handleCancelProductModal = () => {
    resetProductForm();
    setShowAddProductModal(false);
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
    s.on("new-order", fetchOrders);
    s.on("product-updated", fetchProducts);
    s.on("labtest-updated", fetchLabTests);
    s.on("order-updated", fetchOrders);
    return () => {
      s.disconnect();
    };
  }, [isLoggedIn]);

  useEffect(() => {
    setProductOrders(orders.filter((order) => getOrderType(order) === "product"));
    setLabTestOrders(orders.filter((order) => getOrderType(order) === "lab-test"));
    setDoctorOrders(orders.filter((order) => getOrderType(order) === "doctor-consultation"));
  }, [orders]);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">🏥 Healthcare Admin</h2>
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
              {isLoggingIn ? "Logging in..." : "Login to Dashboard"}
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
  const acceptedOrders = orders.filter(o => o.status === "Accepted").length;

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
            clearAuthSession();
            setIsLoggedIn(false);
          }}
          adminName="Ajeet Gautam"
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's your business performance.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={HiShoppingCart} label="Total Orders" value={orders.length} color="#0F766E" />
                <StatsCard icon={HiChartBar} label="Products" value={products.length} color="#22C55E" />
                <StatsCard icon={HiBell} label="Lab Tests" value={labTests.length} color="#2563EB" />
                <StatsCard icon={HiUser} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="#F59E0B" />
              </div>

              {/* Quick Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold">⏳ Pending Orders: {pendingOrders}</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✅ Accepted Orders: {acceptedOrders}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg">
                  Pending: <span className="font-bold text-orange-600 text-lg">{productOrders.filter(o => o.status === "Pending").length}</span>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Placed</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          No product orders yet
                        </td>
                      </tr>
                    ) : productOrders.map((order, idx) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customerPhone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{order.totalAmount}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
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
                              <button onClick={() => handleAcceptOrder(order._id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1">
                                <HiCheck size={14} /> Accept
                              </button>
                              <button onClick={() => handleRejectOrder(order._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1">
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
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                  <p className="text-gray-600 text-sm mt-1">Total Products: <span className="font-bold text-teal-600">{products.length}</span></p>
                </div>
                <button
                  onClick={() => {
                    resetProductForm();
                    setShowAddProductModal(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg"
                >
                  <HiPlus size={20} /> Add Product
                </button>
              </div>

              {/* Add Product Modal */}
              <AddProductModal
                isOpen={showAddProductModal}
                onClose={handleCancelProductModal}
                onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}
                form={productForm}
                setForm={setProductForm}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                handleImageUpload={handleImageUpload}
                isEditing={Boolean(editingProductId)}
              />

              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Products Table */}
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products yet. Click "Add Product" to get started!</p>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                        .map((product, idx) => (
                        <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm">
                            {product.image ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={normalizeImage(product.image) || "/images/medicine.jpg"}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs">
                            <div className="truncate">{product.title}</div>
                            <div className="text-xs text-gray-500 truncate">{product.description}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{product.amount}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {product.stock || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                          <td className="px-4 py-3 text-sm flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                            >
                              <HiPencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                            >
                              <HiTrash size={14} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Lab Tests Tab */}
          {activeTab === "lab-tests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Lab Tests Management</h1>
                  <p className="text-gray-600 text-sm mt-1">Total Orders: <span className="font-bold text-teal-600">{labTestOrders.length}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pending Lab Orders</h3>
                  <p className="text-3xl font-bold text-blue-600">{labTestOrders.filter(o => o.status === "Pending").length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Accepted Lab Orders</h3>
                  <p className="text-3xl font-bold text-green-600">{labTestOrders.filter(o => o.status === "Accepted").length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Lab Revenue</h3>
                  <p className="text-3xl font-bold text-yellow-600">₹{labTestOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Lab Test Orders</h2>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Test Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTestOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No lab test orders yet
                        </td>
                      </tr>
                    ) : (
                      labTestOrders.map((order, idx) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.customerPhone}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.items?.[0]?.title || "Lab Test"}</td>
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
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Doctor Consult Tab */}
          {activeTab === "doctor-consult" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Doctor Consultations</h1>
                  <p className="text-gray-600 text-sm mt-1">Manage doctor consultations and appointments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Consultations</h3>
                  <p className="text-3xl font-bold text-purple-600">{doctorOrders.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pending Appointments</h3>
                  <p className="text-3xl font-bold text-orange-600">{doctorOrders.filter(o => o.status === "Pending").length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-green-600">{doctorOrders.filter(o => o.status === "Accepted" || o.status === "Delivered").length}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-l-4 border-pink-500 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Revenue</h3>
                  <p className="text-3xl font-bold text-pink-600">₹{doctorOrders.reduce((sum, order) => sum + order.totalAmount, 0)}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Doctor Consultation Orders</h2>
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Doctor Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No doctor consultation orders yet
                        </td>
                      </tr>
                    ) : (
                      doctorOrders.map((order, idx) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.customerPhone}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.doctorType || order.items?.[0]?.title || "Doctor Consultation"}</td>
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
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
                <p className="text-gray-600">Comprehensive business insights and KPI metrics</p>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
                  <p className="text-4xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-green-600 mt-2">+12% from last month</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
                  <p className="text-4xl font-bold text-gray-900">₹{(totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-2">+8% from last month</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Products</p>
                  <p className="text-4xl font-bold text-gray-900">{products.length}</p>
                  <p className="text-xs text-green-600 mt-2">+5 new products</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-orange-500">
                  <p className="text-gray-600 text-sm font-medium mb-2">Lab Tests Sold</p>
                  <p className="text-4xl font-bold text-gray-900">{labTestOrders.length}</p>
                  <p className="text-xs text-green-600 mt-2">+3% from last month</p>
                </div>
              </div>

              {/* Revenue Dashboard */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Products Sales</span>
                      <span className="text-lg font-bold text-teal-600">₹{Math.round((totalRevenue || 0) * 0.65).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Lab Tests</span>
                      <span className="text-lg font-bold text-blue-600">₹{Math.round((totalRevenue || 0) * 0.25).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Consultations</span>
                      <span className="text-lg font-bold text-purple-600">₹{Math.round((totalRevenue || 0) * 0.10).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Status</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Pending Orders</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((pendingOrders || 0) / (orders.length || 1)) * 100}%` }}></div>
                        </div>
                        <span className="text-lg font-bold text-yellow-600">{pendingOrders}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">Accepted Orders</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((acceptedOrders || 0) / (orders.length || 1)) * 100}%` }}></div>
                        </div>
                        <span className="text-lg font-bold text-green-600">{acceptedOrders}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total Orders</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{orders.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Statistics */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="text-2xl font-bold text-red-600">23.32%</span>
                    </div>
                    <div className="h-16 bg-gradient-to-tr from-red-200 to-red-100 rounded-lg"></div>
                    <p className="text-xs text-red-500">📉 2.1% increased</p>
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-gray-600">Page Views</span>
                      <span className="text-2xl font-bold text-blue-600">42.32%</span>
                    </div>
                    <div className="h-16 bg-gradient-to-tr from-blue-200 to-blue-100 rounded-lg"></div>
                    <p className="text-xs text-blue-500">📈 1.3% increased</p>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Purchases</span>
                      <span className="font-bold">20.89%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#e5e7eb" strokeWidth="8"></circle>
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray={`${(20.89 / 100) * 188.4} 188.4`}></circle>
                        </svg>
                      </div>
                      <span className="text-gray-600 text-sm">20.89% of<br/>total revenue</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Online Sales</span>
                      <span className="font-bold">80.26%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#e5e7eb" strokeWidth="8"></circle>
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={`${(80.26 / 100) * 188.4} 188.4`}></circle>
                        </svg>
                      </div>
                      <span className="text-gray-600 text-sm">80.26% of<br/>total revenue</span>
                    </div>
                  </div>
                </div>

                {/* User Rating */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">User Ratings</h3>
                  <div className="text-center mb-4">
                    <div className="flex justify-center gap-1 mb-2">
                      <span className="text-3xl">⭐⭐⭐⭐</span>
                      <span className="text-gray-300 text-3xl">☆</span>
                    </div>
                    <p className="text-sm text-gray-600">Average Rating 4.0</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">5 Star</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <span className="text-sm font-semibold">92</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">4 Star</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="text-sm font-semibold">64</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">3 Star</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-semibold">32</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">17 of your friends liked this</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
                <p className="text-gray-600">⚙️ Settings and configurations coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
