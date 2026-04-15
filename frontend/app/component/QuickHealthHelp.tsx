 "use client";

import { useState, useRef, useEffect } from "react";
import { HiX } from "react-icons/hi";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const solutions: any = {
  headache: {
    title: "Headache relief",
    solution: "Take Paracetamol 500mg, stay hydrated, rest in a quiet place for 30 minutes. Avoid bright lights.",
  },
  fever: {
    title: "Fever medicine?",
    solution: "Use Paracetamol 650mg or Ibuprofen 400mg every 4-6 hours. Drink fluids, monitor temperature regularly.",
  },
  cough: {
    title: "Cold remedies",
    solution: "Use cough syrup, drink warm water with honey, avoid cold drinks. Rest well for 2-3 days.",
  },
  acidity: {
    title: "Acidity relief",
    solution: "Take antacids like Ranitidine 150mg, avoid spicy food, eat light meals. Drink milk.",
  },
  diabetes: {
    title: "Diabetes medicines",
    solution: "Maintain regular diet, exercise daily, take prescribed insulin/medicines. Monitor blood sugar levels.",
  },
  allergy: {
    title: "Allergy relief",
    solution: "Use antihistamines like Cetirizine 10mg, avoid allergens, consult doctor if severe symptoms persist.",
  },
  burns: {
    title: "First aid for burns",
    solution: "Cool the burn with cold water for 10-20 minutes. Apply aloe vera gel. Cover with sterile bandage.",
  },
};

export default function QuickHealthHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I'm PharmaCare AI. I can help you with medicine information, disease guidance, prescriptions, and first aid. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const generateAIResponse = (userMsg: string): string => {
    const lowerMsg = userMsg.toLowerCase();

    // Health conditions and symptoms
    if (lowerMsg.includes("headache") || lowerMsg.includes("head pain") || lowerMsg.includes("migraine")) {
      return "For headaches, I recommend Paracetamol 500mg or Ibuprofen 400mg. Make sure to stay hydrated and rest in a quiet, dark place. If the pain persists for more than a few days or is severe, please consult a healthcare professional.";
    }
    if (lowerMsg.includes("fever") || lowerMsg.includes("temperature") || lowerMsg.includes("hot")) {
      return "Fever is your body's way of fighting infection. Use Paracetamol 650mg or Ibuprofen 400mg every 4-6 hours, stay hydrated with water and electrolytes, and get plenty of rest. If your temperature exceeds 103°F or persists beyond 3 days, seek medical attention.";
    }
    if (lowerMsg.includes("cough") || lowerMsg.includes("cold") || lowerMsg.includes("throat")) {
      return "For cough relief, use cough syrup, drink warm water with honey and ginger, and stay hydrated. Avoid cold drinks and stay rested. If the cough persists for more than 2-3 weeks or worsens, see a doctor.";
    }
    if (lowerMsg.includes("acidity") || lowerMsg.includes("acid reflux") || lowerMsg.includes("heartburn") || lowerMsg.includes("indigestion")) {
      return "For acidity and indigestion, use antacids like Ranitidine 150mg or Omeprazole. Avoid spicy, fatty, and acidic foods. Eat smaller, frequent meals, stay hydrated, and avoid eating before bedtime. If symptoms persist, consult a physician.";
    }
    if (lowerMsg.includes("diabetes") || lowerMsg.includes("blood sugar") || lowerMsg.includes("glucose")) {
      return "Diabetes management requires regular blood sugar monitoring, proper medication adherence, and lifestyle changes. Maintain a balanced diet, exercise daily, and keep all appointments with your healthcare provider. Always take your prescribed medications.";
    }
    if (lowerMsg.includes("allergy") || lowerMsg.includes("allergic") || lowerMsg.includes("itching") || lowerMsg.includes("rash")) {
      return "For allergies, antihistamines like Cetirizine 10mg are effective. Identify and avoid your triggers. For mild reactions, over-the-counter antihistamines help. For severe reactions, seek immediate medical care.";
    }
    if (lowerMsg.includes("burn") || lowerMsg.includes("burned") || lowerMsg.includes("scald")) {
      return "For minor burns: Cool the area with cool water for 10-20 minutes, apply aloe vera gel or antibiotic ointment, and cover with sterile bandage. Avoid ice directly on skin. For severe burns or those covering large areas, seek emergency care immediately.";
    }

    // Medicine inquiries
    if (lowerMsg.includes("paracetamol") || lowerMsg.includes("acetaminophen") || lowerMsg.includes("tylenol")) {
      return "Paracetamol (500-650mg) is used for pain relief and fever reduction. Take every 4-6 hours with meals. Maximum 4000mg per day. Avoid if allergic, and consult a doctor before use if you have liver problems.";
    }
    if (lowerMsg.includes("ibuprofen")) {
      return "Ibuprofen (200-400mg) is an anti-inflammatory pain reliever. Take with food to prevent stomach upset. Use every 4-6 hours as needed. Maximum 1200-1600mg per day. Avoid if allergic or if you have stomach ulcers.";
    }
    if (lowerMsg.includes("antibiotic") || lowerMsg.includes("infection")) {
      return "Antibiotics treat bacterial infections. Always use as prescribed and complete the full course even if you feel better. Do not take if allergic. Inform your doctor of any previous antibiotic reactions or side effects.";
    }

    // First aid
    if (lowerMsg.includes("first aid") || lowerMsg.includes("emergency") || lowerMsg.includes("wound")) {
      return "Basic first aid includes: stopping bleeding with clean pressure, cleaning wounds with soap and water, applying antibiotic ointment, and bandaging. For serious injuries, fractures, or heavy bleeding, call emergency services immediately.";
    }

    // Lifestyle and prevention
    if (lowerMsg.includes("prevention") || lowerMsg.includes("healthy") || lowerMsg.includes("diet") || lowerMsg.includes("exercise")) {
      return "Prevention is key! Maintain a balanced diet rich in fruits and vegetables, exercise regularly (30 mins daily), stay hydrated, get 7-8 hours of sleep, and manage stress. Regular check-ups help catch issues early.";
    }

    // Default response
    return "Thank you for your question! I can help with information about common medicines, health conditions, first aid, and wellness tips. Please ask me about a specific symptom, medicine, or health concern for more detailed guidance. Remember to consult a healthcare professional for serious concerns.";
  };

  const handleSolutionClick = (solution: any) => {
    // Add AI message based on solution
    const aiMsg: Message = {
      role: "ai",
      text: solution.solution,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSend = () => {
    if (!userMessage.trim()) return;

    // Add user message
    const userMsg: Message = {
      role: "user",
      text: userMessage,
      timestamp: new Date(),
    };

    // Generate AI response
    const aiResponse = generateAIResponse(userMessage);
    const aiMsg: Message = {
      role: "ai",
      text: aiResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setUserMessage("");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Full Screen Modal */}
      <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-1 flex justify-between items-start shadow-lg">
          <div className="flex-1">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              💊 PharmaCare AI Assistant
            </h2>
          </div>
          <button onClick={onClose} title="Close help" className="p-2 hover:bg-teal-800 rounded-lg transition ml-4">
            <HiX className="h-8 w-8" />
          </button>
        </div>

        {/* Quick Suggestion Buttons */}
        <div className="px-8 py-5 bg-gradient-to-b from-gray-50 to-white border-b">
          <div className="flex gap-3 flex-wrap justify-center">
            {Object.keys(solutions).map((key) => (
              <button
                key={key}
                onClick={() => handleSolutionClick(solutions[key])}
                className="px-5 py-2.5 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full text-sm font-semibold transition whitespace-nowrap shadow-sm"
              >
                {solutions[key].title}?
              </button>
            ))}
          </div>
        </div>

        {/* Message Area - Chat Conversation */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-10 h-10 bg-teal-900 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      🤖
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl px-6 py-4 rounded-xl ${
                    msg.role === "user"
                      ? "bg-teal-900 text-white rounded-br-none"
                      : "bg-white text-gray-800 border-l-4 border-teal-900 shadow-md rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed text-base">{msg.text}</p>
                  <p className={`text-xs mt-2 ${msg.role === "user" ? "text-teal-100" : "text-gray-400"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      👤
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-transparent shadow-lg">
          <div className="max-w-3xl mx-auto flex gap-1">
            <input
              type="text"
              placeholder="Ask about a medicine, disease, or first aid..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-900 focus:border-transparent text-gray-800 text-lg"
            />
            <button
              onClick={handleSend}
              disabled={!userMessage.trim() || isLoading}
              className="px-8 py-4 bg-teal-900 hover:bg-teal-800 disabled:bg-gray-400 text-white rounded-xl font-semibold transition shadow-lg "
            >
              Send
            </button>
          </div>
          <br />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

