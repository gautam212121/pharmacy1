"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../lib/backend";
import { useUser } from "../context/UserContext";

type TestType = {
  name: string;
  emoji: string;
  desc: string;
  price: number;
};

const testTypesList: TestType[] = [
  { name: "Blood Tests", emoji: "🩸", desc: "CBC, blood sugar, lipid profile, and liver function", price: 499 },
  { name: "Urine Tests", emoji: "🧪", desc: "Complete urinalysis, infection screening, and renal function", price: 299 },
  { name: "Imaging Tests", emoji: "🩻", desc: "Consultation referrals for X-rays, Ultrasounds, and CT Scans", price: 999 },
  { name: "Cardiac Tests", emoji: "🫀", desc: "ECG, Lipid assessment, and cardiovascular risk indicators", price: 699 },
  { name: "Hormone Tests", emoji: "🧬", desc: "Thyroid Profile (T3, T4, TSH), diabetes, and growth markers", price: 599 },
  { name: "Infectious Disease Tests", emoji: "🦠", desc: "COVID-19, Dengue, Malaria, and viral panels", price: 399 },
];

type LabTestOrder = {
  customerName: string;
  customerPhone: string;
  address: string;
  age: number;
  gender: string;
  testType: string;
};

export default function LabTestsPage() {
  const { user } = useUser();
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [formData, setFormData] = useState<LabTestOrder>({
    customerName: "",
    customerPhone: "",
    address: "",
    age: 0,
    gender: "",
    testType: "",
  });
  const [loading, setLoading] = useState(false);

  // Prefill user details if logged in
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({ ...prev, customerName: user.username }));
    }
  }, [user]);

  const handleSelectTest = (test: TestType) => {
    setSelectedTest(test);
    setFormData((prev) => ({ ...prev, testType: test.name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.address || !formData.age || !formData.gender || !formData.testType || !selectedTest) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    const order = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      address: formData.address,
      items: [{ title: formData.testType, qty: 1, price: selectedTest.price }],
      totalAmount: selectedTest.price,
      orderType: "lab-test",
      status: "Pending",
      age: formData.age,
      gender: formData.gender,
      testType: formData.testType,
      username: user?.username || "",
    };

    try {
      await axios.post(`${API_BASE_URL}/orders`, order);
      alert("✅ Lab test order placed successfully!");
      setFormData({
        customerName: user?.username || "",
        customerPhone: "",
        address: "",
        age: 0,
        gender: "",
        testType: "",
      });
      setSelectedTest(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-teal-950">Book Diagnostic Lab Tests</h1>
        <p className="text-gray-600">Select a diagnostic test or screening package. Our certified lab technicians will visit your home for sample collection at your preferred time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lab Tests Grid */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-teal-950">Available Diagnostic Tests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testTypesList.map((test) => (
                <button
                  key={test.name}
                  onClick={() => handleSelectTest(test)}
                  className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedTest?.name === test.name
                      ? "border-teal-700 bg-teal-50/50 shadow-md ring-2 ring-teal-700/10"
                      : "border-gray-200 bg-white hover:border-teal-900 hover:shadow-md"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {test.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">{test.name}</h3>
                      <span className="font-bold text-teal-955 text-sm">₹{test.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{test.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4 text-teal-950">Sample Collection Form</h2>
          {selectedTest ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-teal-50 text-teal-955 font-semibold rounded-xl text-sm border border-teal-100 flex justify-between items-center">
                <span>Test Selected:</span>
                <span className="bg-teal-900 text-white text-xs px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {selectedTest.name}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Patient Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.age || ""}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    aria-label="Select gender"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Collection Address</label>
                <textarea
                  placeholder="Enter address details"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium font-semibold text-sm">Collection Cost:</span>
                <span className="text-2xl font-bold text-teal-950">₹{selectedTest.price}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-900 hover:bg-teal-800 text-white py-3 text-sm font-semibold transition disabled:opacity-50 shadow-md cursor-pointer"
              >
                {loading ? "Booking Lab Test..." : "Book Diagnostic Test"}
              </button>
            </form>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl block mb-2">👈</span>
              <p className="text-sm font-medium">Please select a diagnostic test to start booking sample collection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}