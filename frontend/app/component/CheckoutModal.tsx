"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../lib/backend";

type Product = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  amount?: number;
  rating?: number;
  discount?: number;
};

type LabTest = {
  _id: string;
  name: string;
  healthConcern: string;
  price: number;
  image?: string;
  rating?: number;
  discount?: number;
};

interface CheckoutModalProps {
  item: Product | LabTest;
  onClose: () => void;
  onSuccess: (message: string, order?: any) => void;
  normalizeImage: (img?: string | null) => string | null;
}

export default function CheckoutModal({ item, onClose, onSuccess, normalizeImage }: CheckoutModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemTitle = (item as any).title || (item as any).name;
  const itemPrice = (item as any).amount || (item as any).price || 0;
  const itemDiscount = (item as any).discount || 0;
  const discountedPrice = itemPrice * (1 - itemDiscount / 100);
  const totalAmount = discountedPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !phone || !address) {
      setError("Please fill in all details");
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const order = {
        customerName: fullName,
        customerPhone: phone,
        address: address,
        items: [
          {
            itemId: item._id,
            title: itemTitle,
            qty: quantity,
            price: discountedPrice,
            originalPrice: itemPrice,
            discount: itemDiscount,
          },
        ],
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        orderType: "product",
        status: "Pending",
      };
//    // backend path required when host the website on server  

      const response = await axios.post(`${API_BASE_URL}/orders`, order);
      const createdOrder = response.data?.order ?? response.data;

      if (response.status === 201 || response.status === 200) {
        onSuccess(`Order placed successfully! Order ID: ${createdOrder?._id ?? "-"}`, createdOrder);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4 text-gray-800">Order Summary</h3>
            <div className="flex gap-4 mb-4">
              <div className="flex-shrink-0">
                {(item as any).image && (
                  <Image
                    src={normalizeImage((item as any).image)!}
                    alt={itemTitle}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{itemTitle}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {(item as any).description || (item as any).healthConcern}
                </p>

                {/* Rating Display */}
                {(item as any).rating && (
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-700 ml-1">{(item as any).rating} / 5</span>
                  </div>
                )}

                {/* Price Display */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">₹{discountedPrice.toFixed(2)}</span>
                  {itemDiscount > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">₹{itemPrice}</span>
                      <span className="text-sm font-semibold text-green-600">{itemDiscount}% OFF</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="font-semibold">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-200"
                >
                  −
                </button>
                <span className="px-4 py-1 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Price ({quantity} item{quantity !== 1 ? "s" : ""}):</span>
              <span>₹{(itemPrice * quantity).toFixed(2)}</span>
            </div>
            {itemDiscount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount ({itemDiscount}%):</span>
                <span>-₹{((itemPrice * itemDiscount / 100) * quantity).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-800">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleSubmit}>
            <h3 className="font-semibold mb-4 text-gray-800">Delivery Details</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address (street, city, state, zip)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <h3 className="font-semibold mb-4 text-gray-800">Payment Method</h3>
            <div className="space-y-3 mb-6">
              {[
                { id: "credit-card", label: "Credit Card" },
                { id: "debit-card", label: "Debit Card" },
                { id: "upi", label: "UPI" },
                { id: "net-banking", label: "Net Banking" },
                { id: "wallet", label: "Digital Wallet" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((method) => (
                <label key={method.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
              >
                {loading ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
