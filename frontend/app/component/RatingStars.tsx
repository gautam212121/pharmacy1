import React from "react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({ rating, reviewCount, size = "md" }: RatingStarsProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {stars.map((star) => (
          <span
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {rating > 0 ? rating.toFixed(1) : "No ratings"}
        {reviewCount && reviewCount > 0 && ` (${reviewCount})`}
      </span>
    </div>
  );
}
