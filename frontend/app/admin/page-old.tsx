"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL, normalizeBackendUrl } from "../lib/backend";

// --- Types ---
type Product = { _id: string; title: string; description: string; amount: number; image: string; category: string; stock?: number; createdAt?: string };
type LabTest = { _id: string; name: string; healthConcern: string; price: number; image?: string; };
type LabTestForm = { _id?: string; name: string; healthConcern: string; price: string; image?: string; preview?: string | null };
type OrderItem = { title: string; qty: number; price: number };
type Order = {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Accepted" | "Delivered" | "Rejected";
  // 'Delivered' status used in UI comparisons
  age?: number;
  gender?: string;
  testType?: string;
  doctorType?: string;
};

// Categories
const categories = [
  "Medicines",
  "Healthcare Products",
  "Medical Equipment",
  "Doctor Consultation",
  "Lab Tests & Health Packages",
  "Health Services"
];

// --- AdminPanel Component ---
export default function AdminPanel() {
  // Helper to normalize image path returned by backend
  const normalizeImage = (img?: string | null) => {
    return normalizeBackendUrl(img);
  };

  // Helper to choose correct image src for previews (handle blob URLs and remote URLs)
  const getImageSrc = (src?: string | null) => {
    if (!src) return undefined;
    if (src.startsWith("blob:") || src.startsWith("data:")) return src;
    return normalizeImage(src) || undefined;
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('adminLoggedIn') === 'true';
    return false;
  });
  const [credentials, setCredentials] = useState({ id: "", password: "" });

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [newProduct, setNewProduct] = useState({ title: "", description: "", amount: "", image: "", category: "", preview: "" as string | null });
  const [editProduct, setEditProduct] = useState({ title: "", description: "", amount: "", image: "", category: "", preview: "" as string | null });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");

  // Lab Tests
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [newTest, setNewTest] = useState<LabTestForm>({ name: "", healthConcern: "", price: "", image: "", preview: null });
  const [editLabTest, setEditLabTest] = useState<LabTestForm>({ _id: "", name: "", healthConcern: "", price: "", image: "", preview: null });
  const [editingLabTestId, setEditingLabTestId] = useState<string | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<"all-orders" | "lab-tests" | "doctor-appointment" | "products">("all-orders");

  // Socket
  const [socket, setSocket] = useState<Socket | null>(null);

  // API URLs
  const API_URL = `${API_BASE_URL}/products`;
  const LABTEST_URL = `${API_BASE_URL}/lab-tests`;
  const ORDER_URL = `${API_BASE_URL}/orders`;
  const UPLOAD_URL = `${API_BASE_URL}/upload`;

  // --- Login ---
  const handleLogin = () => {
    if (credentials.id === "ajeet21" && credentials.password === "12345") {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
    } else alert("Invalid credentials");
  };

  // --- Fetch functions ---
  const fetchProducts = async () => { try { const res = await axios.get(API_URL); setProducts(res.data); } catch (err) { console.error(err); } };
  const fetchLabTests = async () => { try { const res = await axios.get(LABTEST_URL); const items = res.data.map((t: any) => ({ ...t, image: normalizeImage(t.image), createdAt: t.createdAt })); items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); setLabTests(items); } catch (err) { console.error(err); } };
  const fetchOrders = async () => { try { const res = await axios.get<Order[]>(ORDER_URL); setOrders(res.data); } catch (err) { console.error(err); } };

  // --- Data loading helpers ---
  const refreshData = async () => {
    await fetchProducts();
    await fetchLabTests();
    await fetchOrders();
  };

  // --- Initial data fetch ---
  useEffect(() => {
    refreshData();
  }, []);

  // --- Socket.IO ---
  useEffect(() => {
    if (!isLoggedIn) return;

    const s = io(SOCKET_URL);
    setSocket(s);

    s.on("product-updated", fetchProducts);
    s.on("labtest-updated", fetchLabTests);
    s.on("order-updated", fetchOrders);
    s.on("new-order", (order: Order) => setOrders(prev => [order, ...prev]));

    return () => {
      s.disconnect();
    };
  }, [isLoggedIn]);

  // --- Image Upload ---
  const handleImageUpload = async (file: File, editing = false, labTest = false) => {
    const previewUrl = URL.createObjectURL(file);
    if (editing) {
      if (labTest) setEditLabTest(prev => ({ ...prev, preview: previewUrl }));
      else setEditProduct(prev => ({ ...prev, preview: previewUrl }));
    } else {
      if (labTest) setNewTest(prev => ({ ...prev, preview: previewUrl }));
      else setNewProduct(prev => ({ ...prev, preview: previewUrl }));
    }

    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(UPLOAD_URL, formData, { headers: { "Content-Type": "multipart/form-data" } });
      // store normalized image URL in state so frontend always has full URL
      const normalized = normalizeImage(res.data.imageUrl) || res.data.imageUrl;
      if (editing) {
        if (labTest) setEditLabTest(prev => ({ ...prev, image: normalized }));
        else setEditProduct(prev => ({ ...prev, image: normalized }));
      } else {
        if (labTest) setNewTest(prev => ({ ...prev, image: normalized }));
        else setNewProduct(prev => ({ ...prev, image: normalized }));
      }
    } catch (err: any) { alert("Image upload failed: " + err.message); }
  };

  // --- Product Handlers ---
  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.description || !newProduct.amount || !newProduct.image || !newProduct.category) return alert("Fill all fields");
    const res = await axios.post(API_URL, { ...newProduct, amount: Number(newProduct.amount) });
    setProducts(prev => [res.data, ...prev]);
    setNewProduct({ title: "", description: "", amount: "", image: "", category: "", preview: "" });
    socket?.emit("product-updated");
  };
  const handleUpdateProduct = async (id: string) => {
    const res = await axios.put(`${API_URL}/${id}`, { ...editProduct, amount: Number(editProduct.amount) });
    setProducts(prev => prev.map(p => p._id === id ? res.data : p));
    setEditingProductId(null);
    setEditProduct({ title: "", description: "", amount: "", image: "", category: "", preview: "" });
    socket?.emit("product-updated");
  };
  const handleDeleteProduct = async (id: string) => { await axios.delete(`${API_URL}/${id}`); setProducts(prev => prev.filter(p => p._id !== id)); socket?.emit("product-updated"); };

  // --- Lab Test Handlers ---
  const handleAddLabTest = async () => {
    if (!newTest.name || !newTest.healthConcern || !newTest.price || !newTest.image) return alert("Fill all fields");
    const res = await axios.post(LABTEST_URL, { ...newTest, price: Number(newTest.price) });
    const item = { ...res.data, image: normalizeImage(res.data.image) };
    setLabTests(prev => [item, ...prev]);
    setNewTest({ name: "", healthConcern: "", price: "", image: "", preview: null });
    socket?.emit("labtest-updated");
  };
  const handleUpdateLabTest = async (id: string) => {
    const res = await axios.put(`${LABTEST_URL}/${id}`, { ...editLabTest, price: Number(editLabTest.price) });
    const item = { ...res.data, image: normalizeImage(res.data.image) };
    setLabTests(prev => prev.map(t => t._id === id ? item : t));
    setEditingLabTestId(null);
    setEditLabTest({ _id: "", name: "", healthConcern: "", price: "", image: "", preview: null });
    socket?.emit("labtest-updated");
  };
  const handleDeleteLabTest = async (id: string) => { await axios.delete(`${LABTEST_URL}/${id}`); setLabTests(prev => prev.filter(t => t._id !== id)); socket?.emit("labtest-updated"); };

  // --- Order Handlers ---
  const handleAcceptOrder = async (id: string) => { await axios.put(`${ORDER_URL}/${id}`, { status: "Accepted" }); setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Accepted" } : o)); socket?.emit("order-updated"); };
  const handleRejectOrder = async (id: string) => { await axios.delete(`${ORDER_URL}/${id}`); setOrders(prev => prev.filter(o => o._id !== id)); socket?.emit("order-updated"); };

  // --- Login Render ---

  // --- Admin Panel Render ---
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={refreshData} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Refresh Data</button>
        </div>
        <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('adminLoggedIn'); }} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Logout</button>
      </div>
      {/* --- Orders Management --- */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("all-orders")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "all-orders"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab("lab-tests")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "lab-tests"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Lab Tests
          </button>
          <button
            onClick={() => setActiveTab("doctor-appointment")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "doctor-appointment"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Doctor Appointment
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Products Management
          </button>
        </div>

        {/* All Orders Tab */}
        {activeTab === "all-orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">All Orders</h2>
            <button onClick={refreshData} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded mb-4">
              Refresh Orders
            </button>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-green-50 text-left border-b-2 border-green-300">
                    <th className="px-3 py-3 font-bold">#</th>
                    <th className="px-3 py-3 font-bold">Customer</th>
                    <th className="px-3 py-3 font-bold">Phone</th>
                    <th className="px-3 py-3 font-bold">Address</th>
                    <th className="px-3 py-3 font-bold">Items</th>
                    <th className="px-3 py-3 font-bold">Total (₹)</th>
                    <th className="px-3 py-3 font-bold">Date</th>
                    <th className="px-3 py-3 font-bold">Status</th>
                    <th className="px-3 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-gray-600">No orders yet.</td>
                    </tr>
                  ) : orders.map((o, index) => {
                    const statusColor = 
                      o.status === "Pending" ? "bg-yellow-50" :
                      o.status === "Accepted" ? "bg-green-50" :
                      o.status === "Delivered" ? "bg-blue-50" :
                      "bg-red-50";
                    
                    const statusBadgeColor = 
                      o.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                      o.status === "Accepted" ? "bg-green-200 text-green-800" :
                      o.status === "Delivered" ? "bg-blue-200 text-blue-800" :
                      "bg-red-200 text-red-800";

                    return (
                      <tr key={o._id} className={`border-b ${statusColor}`}>
                        <td className="px-3 py-3 font-semibold">{index + 1}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{o.customerName}</td>
                        <td className="px-3 py-3">{o.customerPhone}</td>
                        <td className="px-3 py-3 text-gray-700">{o.address}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-700">
                                {item.title} × {item.qty}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 font-bold text-green-600">₹{o.totalAmount}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{new Date((o as any).createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="px-3 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeColor}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {o.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAcceptOrder(o._id)} 
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleRejectOrder(o._id)} 
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* --- Product Management --- */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold mb-4">Products Management</h2>
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input
            type="text"
            placeholder="Search product"
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg flex-1"
          />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border px-3 py-2 rounded-lg">
            <option value="All Products">All Products</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Upload Date</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => (selectedCategory === "All Products" || p.category === selectedCategory) && (!productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()))).map((p, index) => (
                <tr key={p._id} className="border-t">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 w-24">{p.image && <Image src={normalizeImage(p.image)!} alt={p.title} width={60} height={40} className="rounded" />}</td>
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2">{p.description}</td>
                  <td className="px-3 py-2">₹{p.amount}</td>
                  <td className="px-3 py-2"><span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">{p.category || 'Unassigned'}</span></td>
                  <td className="px-3 py-2">{(p as any).stock ?? 'N/A'}</td>
                  <td className="px-3 py-2">{new Date((p as any).createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="px-3 py-2 flex gap-1">
                    <button onClick={() => {
                      setEditingProductId(p._id);
                      setEditProduct({ title: p.title, description: p.description, amount: String(p.amount), image: p.image, category: p.category, preview: normalizeImage(p.image) });
                    }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Orders Section --- */}

      {/* All Orders */}
      <h1 className="text-lg font-bold mb-2">All Orders</h1>
      <div className="space-y-4 mb-6">
        {orders.map(o => (
          <div key={o._id} className="p-4 border rounded shadow bg-white">
            <div className="items-center mb-2">
              <h3 className="font-bold text-lg">{o.customerName}</h3>
              <p className="text-sm text-gray-500">{o.customerPhone}</p>
            </div> 
            <p className="text-sm mb-2">Address: {o.address}</p>
            {o.age && <p className="text-sm mb-2">Age: {o.age}</p>}
            {o.gender && <p className="text-sm mb-2">Gender: {o.gender}</p>}
            {o.testType && <p className="text-sm mb-2">Test Type: {o.testType}</p>}
            {o.doctorType && <p className="text-sm mb-2">Doctor Type: {o.doctorType}</p>}
            <table className="w-full text-left border-t border-b border-gray-300 mb-2">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1 px-2">Item</th>
                  <th className="py-1 px-2">Qty</th>
                  <th className="py-1 px-2">Price</th>
                  <th className="py-1 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1 px-2">{item.title}</td>
                    <td className="py-1 px-2">{item.qty}</td>
                    <td className="py-1 px-2">₹{item.price}</td>
                    <td className="py-1 px-2">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="font-bold mb-2">Total: ₹{o.totalAmount}</p>
            <p className="mb-2">Status: <span className={`font-semibold ${o.status === 'Pending' ? 'text-yellow-600' : o.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{o.status}</span></p>
            <div className="flex gap-2">
              {o.status === "Pending" && <>
                <button onClick={() => handleAcceptOrder(o._id)} className="bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                <button onClick={() => handleRejectOrder(o._id)} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
              </>}
            </div>
          </div>
        ))}
      </div>

      {/* Doctors Orders */}
      <h1 className="text-lg font-bold mb-2">Doctors</h1>
      <div className="space-y-4 mb-6">
        {orders.filter(o => o.doctorType).map(o => (
          <div key={o._id} className="p-4 border rounded shadow bg-white">
            <div className="items-center mb-2">
              <h3 className="font-bold text-lg">{o.customerName}</h3>
              <p className="text-sm text-gray-500">{o.customerPhone}</p>
            </div> 
            <p className="text-sm mb-2">Address: {o.address}</p>
            {o.age && <p className="text-sm mb-2">Age: {o.age}</p>}
            {o.gender && <p className="text-sm mb-2">Gender: {o.gender}</p>}
            {o.doctorType && <p className="text-sm mb-2">Doctor Type: {o.doctorType}</p>}
            <table className="w-full text-left border-t border-b border-gray-300 mb-2">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1 px-2">Item</th>
                  <th className="py-1 px-2">Qty</th>
                  <th className="py-1 px-2">Price</th>
                  <th className="py-1 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1 px-2">{item.title}</td>
                    <td className="py-1 px-2">{item.qty}</td>
                    <td className="py-1 px-2">₹{item.price}</td>
                    <td className="py-1 px-2">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="font-bold mb-2">Total: ₹{o.totalAmount}</p>
            <p className="mb-2">Status: <span className={`font-semibold ${o.status === 'Pending' ? 'text-yellow-600' : o.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{o.status}</span></p>
            <div className="flex gap-2">
              {o.status === "Pending" && <>
                <button onClick={() => handleAcceptOrder(o._id)} className="bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                <button onClick={() => handleRejectOrder(o._id)} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
              </>}
            </div>
          </div>
        ))}
      </div>

        {/* Lab Tests Tab */}
        {activeTab === "lab-tests" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Lab Tests</h2>
            
            {/* Add/Edit Lab Test Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">{editingLabTestId ? "Edit Lab Test" : "Add New Lab Test"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input placeholder="Name" value={editingLabTestId ? editLabTest.name : newTest.name} onChange={e => editingLabTestId ? setEditLabTest({ ...editLabTest, name: e.target.value }) : setNewTest({ ...newTest, name: e.target.value })} className="border px-3 py-2 rounded-lg" />
                <input placeholder="Health Concern" value={editingLabTestId ? editLabTest.healthConcern : newTest.healthConcern} onChange={e => editingLabTestId ? setEditLabTest({ ...editLabTest, healthConcern: e.target.value }) : setNewTest({ ...newTest, healthConcern: e.target.value })} className="border px-3 py-2 rounded-lg" />
                <input type="number" placeholder="Price" value={editingLabTestId ? editLabTest.price : newTest.price} onChange={e => editingLabTestId ? setEditLabTest({ ...editLabTest, price: e.target.value }) : setNewTest({ ...newTest, price: e.target.value })} className="border px-3 py-2 rounded-lg" />
                <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], editingLabTestId !== null, true)} className="border px-3 py-2 rounded-lg" aria-label="Upload lab test image" />
              </div>
              {(editingLabTestId ? editLabTest.preview : newTest.preview) && <img src={getImageSrc(editingLabTestId ? editLabTest.preview : newTest.preview)} alt="Preview" className="w-48 h-28 mt-4 object-cover rounded-lg" />}
              <div className="mt-4">
                {editingLabTestId ? <button onClick={() => handleUpdateLabTest(editingLabTestId)} className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2">Save</button> :
                  <button onClick={handleAddLabTest} className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">Add Lab Test</button>}
                {editingLabTestId && <button onClick={() => setEditingLabTestId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>}
              </div>
            </div>

            {/* Lab Tests List Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Lab Tests List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Image</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Health Concern</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-gray-600">No lab tests added yet.</td>
                      </tr>
                    ) : labTests.map((test, index) => (
                      <tr key={test._id} className="border-t">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 w-24">{test.image && <Image src={normalizeImage(test.image)!} alt={test.name} width={60} height={40} className="rounded" />}</td>
                        <td className="px-3 py-2">{test.name}</td>
                        <td className="px-3 py-2">{test.healthConcern}</td>
                        <td className="px-3 py-2">₹{test.price}</td>
                        <td className="px-3 py-2 flex gap-1">
                          <button onClick={() => {
                            setEditingLabTestId(test._id);
                            setEditLabTest({ _id: test._id, name: test.name, healthConcern: test.healthConcern, price: String(test.price), image: test.image, preview: normalizeImage(test.image) });
                          }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Edit</button>
                          <button onClick={() => handleDeleteLabTest(test._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lab Tests Orders Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Lab Test Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-green-50 text-left border-b-2 border-green-300">
                      <th className="px-3 py-3 font-bold">#</th>
                      <th className="px-3 py-3 font-bold">Customer</th>
                      <th className="px-3 py-3 font-bold">Phone</th>
                      <th className="px-3 py-3 font-bold">Address</th>
                      <th className="px-3 py-3 font-bold">Test Type</th>
                      <th className="px-3 py-3 font-bold">Age/Gender</th>
                      <th className="px-3 py-3 font-bold">Items</th>
                      <th className="px-3 py-3 font-bold">Total (₹)</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                      <th className="px-3 py-3 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.testType).length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-3 py-4 text-center text-gray-600">No lab test orders yet.</td>
                      </tr>
                    ) : orders.filter(o => o.testType).map((o, index) => {
                      const statusColor = 
                        o.status === "Pending" ? "bg-yellow-50" :
                        o.status === "Accepted" ? "bg-green-50" :
                        o.status === "Delivered" ? "bg-blue-50" :
                        "bg-red-50";
                      
                      const statusBadgeColor = 
                        o.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                        o.status === "Accepted" ? "bg-green-200 text-green-800" :
                        o.status === "Delivered" ? "bg-blue-200 text-blue-800" :
                        "bg-red-200 text-red-800";

                      return (
                        <tr key={o._id} className={`border-b ${statusColor}`}>
                          <td className="px-3 py-3 font-semibold">{index + 1}</td>
                          <td className="px-3 py-3 font-semibold text-gray-800">{o.customerName}</td>
                          <td className="px-3 py-3">{o.customerPhone}</td>
                          <td className="px-3 py-3 text-gray-700">{o.address}</td>
                          <td className="px-3 py-3 font-medium">{o.testType || '-'}</td>
                          <td className="px-3 py-3 text-gray-700">{o.age || '-'} / {o.gender || '-'}</td>
                          <td className="px-3 py-3">
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {o.items.map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-700">
                                  {item.title} × {item.qty}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-bold text-green-600">₹{o.totalAmount}</td>
                          <td className="px-3 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeColor}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {o.status === "Pending" ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleAcceptOrder(o._id)} 
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleRejectOrder(o._id)} 
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Appointment Tab */}
        {activeTab === "doctor-appointment" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Doctor Appointments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-green-50 text-left border-b-2 border-green-300">
                    <th className="px-3 py-3 font-bold">#</th>
                    <th className="px-3 py-3 font-bold">Customer</th>
                    <th className="px-3 py-3 font-bold">Phone</th>
                    <th className="px-3 py-3 font-bold">Address</th>
                    <th className="px-3 py-3 font-bold">Doctor Type</th>
                    <th className="px-3 py-3 font-bold">Age/Gender</th>
                    <th className="px-3 py-3 font-bold">Services</th>
                    <th className="px-3 py-3 font-bold">Total (₹)</th>
                    <th className="px-3 py-3 font-bold">Status</th>
                    <th className="px-3 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.doctorType).length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-4 text-center text-gray-600">No doctor appointments yet.</td>
                    </tr>
                  ) : orders.filter(o => o.doctorType).map((o, index) => {
                    const statusColor = 
                      o.status === "Pending" ? "bg-yellow-50" :
                      o.status === "Accepted" ? "bg-green-50" :
                      o.status === "Delivered" ? "bg-blue-50" :
                      "bg-red-50";
                    
                    const statusBadgeColor = 
                      o.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                      o.status === "Accepted" ? "bg-green-200 text-green-800" :
                      o.status === "Delivered" ? "bg-blue-200 text-blue-800" :
                      "bg-red-200 text-red-800";

                    return (
                      <tr key={o._id} className={`border-b ${statusColor}`}>
                        <td className="px-3 py-3 font-semibold">{index + 1}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{o.customerName}</td>
                        <td className="px-3 py-3">{o.customerPhone}</td>
                        <td className="px-3 py-3 text-gray-700">{o.address}</td>
                        <td className="px-3 py-3 font-medium">{o.doctorType || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{o.age || '-'} / {o.gender || '-'}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-700">
                                {item.title} × {item.qty}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 font-bold text-green-600">₹{o.totalAmount}</td>
                        <td className="px-3 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeColor}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {o.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAcceptOrder(o._id)} 
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleRejectOrder(o._id)} 
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Management Tab */}
        {activeTab === "products" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Products Management</h2>
            
            {/* Add/Edit Product Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input placeholder="Title" value={editingProductId ? editProduct.title : newProduct.title} onChange={e => editingProductId ? setEditProduct({ ...editProduct, title: e.target.value }) : setNewProduct({ ...newProduct, title: e.target.value })} className="border px-3 py-2 rounded-lg" />
                <input placeholder="Description" value={editingProductId ? editProduct.description : newProduct.description} onChange={e => editingProductId ? setEditProduct({ ...editProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })} className="border px-3 py-2 rounded-lg" />
                <input type="number" placeholder="Amount" value={editingProductId ? editProduct.amount : newProduct.amount} onChange={e => editingProductId ? setEditProduct({ ...editProduct, amount: e.target.value }) : setNewProduct({ ...newProduct, amount: e.target.value })} className="border px-3 py-2 rounded-lg" />
                <select value={editingProductId ? editProduct.category : newProduct.category} onChange={e => editingProductId ? setEditProduct({ ...editProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })} className="border px-3 py-2 rounded-lg" aria-label="Select product category">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="mt-4">
                <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], editingProductId !== null, false)} className="border px-3 py-2 rounded-lg" aria-label="Upload product image" />
              </div>
              {(editingProductId ? editProduct.preview : newProduct.preview) && <img src={getImageSrc(editingProductId ? editProduct.preview : newProduct.preview)} alt="Preview" className="w-48 h-28 mt-4 object-cover rounded-lg" />}
              <div className="mt-4">
                {editingProductId ? <button onClick={() => handleUpdateProduct(editingProductId)} className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2">Save</button> :
                  <button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">Add Product</button>}
                {editingProductId && <button onClick={() => setEditingProductId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>}
              </div>
            </div>

            {/* Products List Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Products List</h3>
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <input
                  type="text"
                  placeholder="Search product"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg flex-1"
                />
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border px-3 py-2 rounded-lg">
                  <option value="All Products">All Products</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Image</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Upload Date</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => (selectedCategory === "All Products" || p.category === selectedCategory) && (!productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()))).map((p, index) => (
                      <tr key={p._id} className="border-t">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 w-24">{p.image && <Image src={normalizeImage(p.image)!} alt={p.title} width={60} height={40} className="rounded" />}</td>
                        <td className="px-3 py-2">{p.title}</td>
                        <td className="px-3 py-2">{p.description}</td>
                        <td className="px-3 py-2">₹{p.amount}</td>
                        <td className="px-3 py-2"><span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">{p.category || 'Unassigned'}</span></td>
                        <td className="px-3 py-2">{(p as any).stock ?? 'N/A'}</td>
                        <td className="px-3 py-2">{new Date((p as any).createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="px-3 py-2 flex gap-1">
                          <button onClick={() => {
                            setEditingProductId(p._id);
                            setEditProduct({ title: p.title, description: p.description, amount: String(p.amount), image: p.image, category: p.category, preview: normalizeImage(p.image) });
                          }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Edit</button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
