"use client";
/// 1---  // backend path required when host the website on server  

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../lib/backend";

const doctorTypes = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Orthopedic Doctor",
  "Pediatrician",
  "Gynecologist",
  "Dentist",
  "Ophthalmologist",
  "Dermatologist",
  "ENT Specialist",
  "Pathologist",
  "Surgeon",
];

type DoctorOrder = {
  customerName: string;
  customerPhone: string;
  address: string;
  age: number;
  gender: string;
  doctorType: string;
};

export default function DoctorsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorOrder>({
    customerName: "",
    customerPhone: "",
    address: "",
    age: 0,
    gender: "",
    doctorType: "",
  });

  const handleSelect = (d: string) => {
    setSelected(d);
    setFormData({ ...formData, doctorType: d });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.address || !formData.age || !formData.gender || !formData.doctorType) {
      alert("Please fill all fields");
      return;
    }

    const order = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      address: formData.address,
      items: [{ title: `Appointment: ${formData.doctorType}`, qty: 1, price: 0 }],
      totalAmount: 0,
      orderType: "doctor-consultation",
      status: "Pending",
      age: formData.age,
      gender: formData.gender,
      doctorType: formData.doctorType,
    };

    
  // backend path required when host the website on server  

    try {
      await axios.post(`${API_BASE_URL}/orders`, order);
      alert(" Appointment request submitted!");
      setFormData({ customerName: "", customerPhone: "", address: "", age: 0, gender: "", doctorType: "" });
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert(" Failed to submit appointment.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Doctors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {doctorTypes.map((d) => (
          <button
            key={d}
            onClick={() => handleSelect(d)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            {d}
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Book {selected}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                aria-label="Select gender"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-80px bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit Appointment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
