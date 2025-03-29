import { Star, StarHalf } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export default function RatingDisplay({ rating, size = "md" }: RatingDisplayProps) {
  // Calculate full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Determine star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return 3;
      case "lg":
        return 5;
      default:
        return 4;
    }
  };

  const starSize = getStarSize();

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`h-${starSize} w-${starSize} text-yellow-400 fill-current`} />
      ))}
      
      {/* Half star */}
      {hasHalfStar && <StarHalf key="half" className={`h-${starSize} w-${starSize} text-yellow-400 fill-current`} />}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`h-${starSize} w-${starSize} text-neutral-300`} />
      ))}
    </div>
  );
}
