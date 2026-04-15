"use client";

import { useState } from "react";

export default function Help() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      // Simulate an async AI response. Replace with real API call if available.
      await new Promise((res) => setTimeout(res, 800));
      setResponse(`You asked: "${prompt}". This is a simulated response.`);
    } catch (err) {
      setResponse("Error getting response.");
    } finally {
      setLoading(false);
    }
  };

  // Using Tailwind classes in JSX instead of inline styles to satisfy linter

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1>Need Help?</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-3">
        <input
          type="text"
          placeholder="Ask something..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 p-2 rounded border border-gray-300"
        />
        <button type="submit" className="px-4 py-2 rounded bg-teal-500 text-white disabled:opacity-60" disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <strong>AI:</strong>
        <p>{response ?? "Ask a question and get a simulated response."}</p>
      </div>
    </div>
  );
}