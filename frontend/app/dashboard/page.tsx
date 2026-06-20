"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { io } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from "../lib/backend";
import Link from "next/link";

type OrderItem = {
  title: string;
  qty: number;
  price: number;
};

type Order = {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderType: "product" | "lab-test" | "doctor-consultation";
  status: "Pending" | "Accepted" | "Rejected" | "Shipped" | "Delivered";
  age?: number;
  gender?: string;
  testType?: string;
  doctorType?: string;
  createdAt: string;
};

export default function UserDashboard() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"product" | "lab-test" | "doctor-consultation">("product");

  const fetchUserOrders = async () => {
    if (!user?.username) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`, {
        params: { username: user.username }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchUserOrders();

      const socket = io(SOCKET_URL);
      socket.on("order-updated", () => {
        fetchUserOrders();
      });
      socket.on("new-order", () => {
        fetchUserOrders();
      });

      return () => {
        socket.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl shadow-teal-100/50 p-8 border border-gray-100">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-teal-950 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">Please log in to your account to access the user dashboard, check order status, and manage appointments.</p>
          <Link href="/Login">
            <button className="w-full rounded-xl bg-teal-900 hover:bg-teal-800 text-white py-3 font-semibold transition cursor-pointer">
              Go to Login Page
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter orders by type
  const filteredOrders = orders.filter((o) => o.orderType === activeTab);

  // Statistics calculation
  const totalOrders = orders.filter(o => o.orderType === "product").length;
  const totalSpent = orders.filter(o => o.orderType === "product" && o.status !== "Rejected")
                           .reduce((sum, o) => sum + o.totalAmount, 0);
  const activeConsultations = orders.filter(o => o.orderType === "doctor-consultation" && o.status === "Pending").length;
  const activeTests = orders.filter(o => o.orderType === "lab-test" && o.status === "Pending").length;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-200 bg-teal-800/50 px-2.5 py-1 rounded-full">User Profile</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-2">Welcome, {user.username}!</h1>
          <p className="text-teal-100/80 mt-1 text-sm md:text-base">Check order tracking, consult updates, and test package statuses in real-time.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition cursor-pointer">
              Shop Medicines
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-teal-100/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-500">Medicine Orders</span>
            <span className="text-xl">📦</span>
          </div>
          <h3 className="text-3xl font-extrabold text-teal-950">{totalOrders}</h3>
          <p className="text-xs text-gray-400 mt-1">Total items ordered</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-teal-100/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-500">Total Spent</span>
            <span className="text-xl">💳</span>
          </div>
          <h3 className="text-3xl font-extrabold text-teal-950">₹{totalSpent.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-1">Excludes rejected orders</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-teal-100/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-500">Pending Doctors</span>
            <span className="text-xl">🩺</span>
          </div>
          <h3 className="text-3xl font-extrabold text-teal-950">{activeConsultations}</h3>
          <p className="text-xs text-gray-400 mt-1">Active appointment requests</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-teal-100/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase text-gray-500">Pending Lab Tests</span>
            <span className="text-xl">🧪</span>
          </div>
          <h3 className="text-3xl font-extrabold text-teal-950">{activeTests}</h3>
          <p className="text-xs text-gray-400 mt-1">Samples yet to be collected</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 flex flex-wrap bg-slate-50/50">
          <button
            onClick={() => setActiveTab("product")}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "product"
                ? "border-teal-700 text-teal-950 bg-white"
                : "border-transparent text-gray-500 hover:text-teal-900"
            }`}
          >
            💊 Medicine Orders
          </button>
          <button
            onClick={() => setActiveTab("lab-test")}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "lab-test"
                ? "border-teal-700 text-teal-950 bg-white"
                : "border-transparent text-gray-500 hover:text-teal-900"
            }`}
          >
            🩸 Lab Test Bookings
          </button>
          <button
            onClick={() => setActiveTab("doctor-consultation")}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "doctor-consultation"
                ? "border-teal-700 text-teal-950 bg-white"
                : "border-transparent text-gray-500 hover:text-teal-900"
            }`}
          >
            🩺 Doctor Consultations
          </button>
        </div>

        {/* Tab Contents Panel */}
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-4">📭</span>
              <p className="text-lg font-semibold text-gray-700">No requests found</p>
              <p className="text-sm text-gray-500 mt-1">You haven't placed any bookings under this category yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order._id} className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">REQUEST ID: {order._id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Submitted: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* Items Details */}
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="text-sm font-bold text-teal-955 uppercase tracking-wider mb-2">Request Details</h4>
                      {order.orderType === "product" ? (
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-slate-800">{item.title} <span className="text-xs font-normal text-gray-500">× {item.qty}</span></span>
                              <span className="font-bold text-slate-900">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
                      ) : order.orderType === "lab-test" ? (
                        <div className="space-y-1 text-sm text-slate-800">
                          <p><span className="font-semibold text-gray-500">Test Package:</span> {order.testType}</p>
                          <p><span className="font-semibold text-gray-500">Patient Age:</span> {order.age} Years</p>
                          <p><span className="font-semibold text-gray-500">Patient Gender:</span> {order.gender}</p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm text-slate-800">
                          <p><span className="font-semibold text-gray-500">Doctor Specialty:</span> {order.doctorType}</p>
                          <p><span className="font-semibold text-gray-500">Patient Age:</span> {order.age} Years</p>
                          <p><span className="font-semibold text-gray-500">Patient Gender:</span> {order.gender}</p>
                        </div>
                      )}
                    </div>

                    {/* Delivery / Shipping details */}
                    <div className="bg-slate-50/50 rounded-xl p-4 text-xs space-y-1.5 border border-gray-100">
                      <h5 className="font-bold text-teal-955 uppercase tracking-wider mb-1">Shipping Details</h5>
                      <p><span className="font-semibold text-gray-500">Contact:</span> {order.customerName}</p>
                      <p><span className="font-semibold text-gray-500">Phone:</span> {order.customerPhone}</p>
                      <p><span className="font-semibold text-gray-500">Address:</span> {order.address}</p>
                      {order.orderType === "product" && (
                        <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-slate-900">
                          <span>Total Amount:</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Progress Timeline Tracker */}
                  {order.status !== "Rejected" && (
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                        <span>Submitted</span>
                        <span>Accepted</span>
                        {order.orderType === "product" ? (
                          <>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </>
                        ) : (
                          <span>Completed</span>
                        )}
                      </div>
                      
                      {/* Timeline bar */}
                      <div className="w-full bg-gray-200 h-2 rounded-full relative overflow-hidden">
                        <div 
                          className="bg-teal-700 h-full transition-all duration-500"
                          style={{
                            width: order.status === "Pending" 
                              ? "10%" 
                              : order.status === "Accepted" 
                              ? "50%" 
                              : order.status === "Shipped" 
                              ? "80%" 
                              : "100%"
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
