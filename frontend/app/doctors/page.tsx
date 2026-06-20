"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../lib/backend";
import { useUser } from "../context/UserContext";

type DoctorSpecialty = {
  name: string;
  emoji: string;
  desc: string;
};

const doctorSpecialties: DoctorSpecialty[] = [
  { name: "General Physician", emoji: "🩺", desc: "Fever, cold, cough, and general wellness" },
  { name: "Cardiologist", emoji: "❤️", desc: "Heart health, chest pain, and blood pressure" },
  { name: "Neurologist", emoji: "🧠", desc: "Brain, spine, nerves, and severe migraines" },
  { name: "Orthopedic Doctor", emoji: "🦴", desc: "Bone pain, fractures, joints, and arthritis" },
  { name: "Pediatrician", emoji: "👶", desc: "Infant, child care, and vaccinations" },
  { name: "Gynecologist", emoji: "🤰", desc: "Pregnancy, women's health, and hygiene" },
  { name: "Dentist", emoji: "🦷", desc: "Toothache, cavities, root canal, and gums" },
  { name: "Ophthalmologist", emoji: "👁️", desc: "Eye checkups, cataracts, and vision specs" },
  { name: "Dermatologist", emoji: "💇", desc: "Acne, skin allergy, hair fall, and rashes" },
  { name: "ENT Specialist", emoji: "👂", desc: "Ear pain, nasal congestion, and throat issues" },
  { name: "Pathologist", emoji: "🔬", desc: "Diagnostic lab analysis and reports" },
  { name: "Surgeon", emoji: "🔪", desc: "General surgeries and operative consults" },
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
  const { user } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorOrder>({
    customerName: "",
    customerPhone: "",
    address: "",
    age: 0,
    gender: "",
    doctorType: "",
  });
  const [loading, setLoading] = useState(false);

  // Prefill name if logged in
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({ ...prev, customerName: user.username }));
    }
  }, [user]);

  const handleSelect = (d: string) => {
    setSelected(d);
    setFormData((prev) => ({ ...prev, doctorType: d }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.address || !formData.age || !formData.gender || !formData.doctorType) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
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
      username: user?.username || "",
    };

    try {
      await axios.post(`${API_BASE_URL}/orders`, order);
      alert("✅ Appointment request submitted!");
      setFormData({ 
        customerName: user?.username || "", 
        customerPhone: "", 
        address: "", 
        age: 0, 
        gender: "", 
        doctorType: "" 
      });
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-teal-950">Book a Doctor Consultation</h1>
        <p className="text-gray-600">Choose a specialty below to book an appointment with our verified specialist doctors. Fill in your details, and our coordinator will schedule your consult shortly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Specialties Grid */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-teal-950">Select Specialty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctorSpecialties.map((d) => (
                <button
                  key={d.name}
                  onClick={() => handleSelect(d.name)}
                  className={`flex items-start text-left gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selected === d.name
                      ? "border-teal-700 bg-teal-50/50 shadow-md ring-2 ring-teal-700/10"
                      : "border-gray-200 bg-white hover:border-teal-900 hover:shadow-md"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {d.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm md:text-base">{d.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{d.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg shadow-teal-100/50 p-6 border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4 text-teal-950">Booking Form</h2>
          {selected ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-teal-50 text-teal-950 font-semibold rounded-xl text-sm border border-teal-100 flex justify-between items-center">
                <span>Specialist:</span>
                <span className="bg-teal-900 text-white text-xs px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {selected}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter patient's name"
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
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Residential Address</label>
                <textarea
                  placeholder="Enter address details"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 text-black text-sm bg-slate-50 placeholder:text-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-900 hover:bg-teal-800 text-white py-3 text-sm font-semibold transition disabled:opacity-50 shadow-md cursor-pointer"
              >
                {loading ? "Scheduling..." : "Request Appointment"}
              </button>
            </form>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl block mb-2">👈</span>
              <p className="text-sm font-medium">Please select a specialty to start booking your consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
