import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Testimonial } from "@/data/villas";
import { getAverageRating } from "@/utils/booking";

interface ReviewsSectionProps {
  reviews: Testimonial[];
  averageRating: number;
  totalReviews: number;
}

const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-4">
    <span className="w-28 text-sm text-muted-foreground">{label}</span>
    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / 5) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-full bg-primary rounded-full"
      />
    </div>
    <span className="w-8 text-sm font-medium">{value.toFixed(1)}</span>
  </div>
);

const ReviewCard = ({ review }: { review: Testimonial }) => {
  const avgRating = getAverageRating(review.ratings);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border pb-6 last:border-0"
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{review.name}</h4>
          <p className="text-sm text-muted-foreground">{review.country}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(avgRating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
        </div>
      </div>

      <p className="text-foreground/80 mb-4">{review.review}</p>

      {review.hostResponse && (
        <div className="bg-secondary/30 rounded-lg p-4 ml-4 border-l-2 border-primary">
          <p className="text-sm font-medium text-foreground mb-1">Host response:</p>
          <p className="text-sm text-muted-foreground">{review.hostResponse}</p>
        </div>
      )}
    </motion.div>
  );
};

const ReviewsSection = ({ reviews, averageRating, totalReviews }: ReviewsSectionProps) => {
  // Calculate average for each category
  const categoryAverages = reviews.reduce(
    (acc, review) => {
      Object.keys(review.ratings).forEach((key) => {
        const k = key as keyof typeof review.ratings;
        acc[k] = (acc[k] || 0) + review.ratings[k];
      });
      return acc;
    },
    {} as Record<string, number>
  );

  Object.keys(categoryAverages).forEach((key) => {
    categoryAverages[key] = categoryAverages[key] / reviews.length;
  });

  const categories = [
    { key: "cleanliness", label: "Cleanliness" },
    { key: "communication", label: "Communication" },
    { key: "checkIn", label: "Check-in" },
    { key: "accuracy", label: "Accuracy" },
    { key: "location", label: "Location" },
    { key: "value", label: "Value" },
  ];

  return (
    <div>
      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-8">
        <div className="text-center">
          <div className="text-5xl font-display font-bold text-foreground mb-1">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={
                  i < Math.round(averageRating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {categories.map(({ key, label }) => (
            <RatingBar
              key={key}
              label={label}
              value={categoryAverages[key] || 5}
            />
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Show More */}
      {reviews.length < totalReviews && (
        <button className="w-full mt-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
          Show all {totalReviews} reviews
        </button>
      )}
    </div>
  );
};

export default ReviewsSection;
