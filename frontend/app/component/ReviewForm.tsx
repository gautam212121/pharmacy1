"use client";

import { useState } from "react";
import axios from "axios";

interface ReviewFormProps {
  productId: string;
  productType: "product" | "labtest";
  onReviewAdded?: () => void;
}

export default function ReviewForm({ productId, productType, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);

      // backend path required when host the website on server  

    try {
      const endpoint =
        productType === "labtest"
          ? `http://localhost:5000/api/lab-tests/${productId}/review`
          : `http://localhost:5000/api/products/${productId}/review`;

      await axios.post(endpoint, {
        userId: "guest-user",
        userName: userName.trim(),
        rating: parseInt(rating.toString()),
        comment: comment.trim(),
      });

      setSuccess("Review added successfully!");
      setRating(5);
      setUserName("");
      setComment("");

      if (onReviewAdded) {
        onReviewAdded();
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-4">
      <h4 className="font-semibold mb-4">Add Your Review</h4>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-4">{success}</div>}

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Name *</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">Review (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
        >
          {loading ? "Adding Review..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
