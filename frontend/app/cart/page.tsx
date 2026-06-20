"use client";
import { useCart } from "../context/cartContext";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from "../lib/backend";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize fields with user info if available
  useEffect(() => {
    if (user?.username) {
      setName(user.username);
    }
  }, [user]);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return alert("Cart is empty!");
    if (!name.trim() || !phone.trim() || !address.trim()) {
      return alert("Please fill in all shipping details");
    }

    setLoading(true);
    const order = {
      customerName: name,
      customerPhone: phone,
      address: address,
      items: cart.map(item => ({ 
        title: item.product.title, 
        qty: item.qty, 
        price: item.product.amount 
      })),
      totalAmount: cart.reduce((sum, item) => sum + (item.product.amount * item.qty), 0),
      orderType: "product",
      status: "Pending",
      username: user?.username || "",
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/orders`, order);
      if (res.status === 201) {
        alert("✅ Order placed successfully!");
        clearCart();
        socket?.emit("new-order", res.data.order);
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.amount * item.qty), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-slate-50/50">
      <h1 className="text-3xl font-extrabold mb-8 text-teal-950">Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-8 border border-gray-100">
          <span className="text-5xl block mb-4">🛒</span>
          <p className="text-xl font-semibold text-gray-700">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-2">Explore our medicines and products on the homepage!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-teal-950">Carted Items ({cart.length})</h2>
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.product._id} className="py-4 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-950">{item.product.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.qty} × ₹{item.product.amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-950">₹{item.product.amount * item.qty}</p>
                      <button 
                        onClick={() => removeFromCart(item.product._id)} 
                        className="text-xs text-red-500 hover:text-red-700 hover:underline mt-2 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Details Form */}
          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-6 border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4 text-teal-950">Shipping Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter recipient's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Delivery Address</label>
                <textarea
                  placeholder="Enter complete house/street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Grand Total:</span>
                <span className="text-2xl font-bold text-teal-950">₹{totalAmount}</span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-teal-900 hover:bg-teal-800 text-white py-3 text-sm font-semibold transition disabled:opacity-50 shadow-md cursor-pointer text-center"
              >
                {loading ? "Placing Order..." : "Place Order (COD)"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
