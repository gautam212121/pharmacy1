"use client";
import { useCart } from "../context/cartContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from "../lib/backend";

type OrderItem = { title: string; qty: number; price: number };

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [socket, setSocket] = useState<Socket | null>(null);

// 2---- // backend path required when host the website on server  


  useEffect(() => { setSocket(io(SOCKET_URL)); return () => socket?.disconnect(); }, []);

  const handlePlaceOrder = async () => {
    if (!cart.length) return alert("Cart is empty!");

    const order = {
      customerName: "Guest User",
      customerPhone: "0000000000",
      address: "Sample Address",
      items: cart.map(item => ({ title: item.product.title, qty: item.qty, price: item.product.amount })),
      totalAmount: cart.reduce((sum, item) => sum + (item.product.amount * item.qty), 0),
      orderType: "product",
      status: "Pending",
    };


//  // backend path required when host the website on server  

    try {
      const res = await axios.post(`${API_BASE_URL}/orders`, order);
      if (res.status === 201) {
        alert("✅ Order placed!");
        clearCart();
        socket?.emit("new-order", res.data.order);
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to place order.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cart</h1>
      {cart.length === 0 ? <p>Your cart is empty</p> :
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.product._id} className="p-4 border rounded flex justify-between items-center">
              <span>{item.product.title} x {item.qty} - ₹{item.product.amount * item.qty}</span>
              <button onClick={() => removeFromCart(item.product._id)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
            </div>
          ))}
          <div className="mt-4 flex justify-between items-center">
            <p className="font-bold">Total: ₹{cart.reduce((sum, item) => sum + (item.product.amount * item.qty), 0)}</p>
            <button onClick={handlePlaceOrder} className="bg-green-600 text-white px-4 py-2 rounded">Place Order</button>
          </div>
        </div>
      }
    </div>
  );
}
