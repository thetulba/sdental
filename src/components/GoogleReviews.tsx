import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

export const GoogleReviews = ({ placeId }: { placeId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?placeId=${placeId}`);
        const data = await response.json();
        if (data.result && data.result.reviews) {
          setReviews(data.result.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [placeId]);

  if (loading) return <div>Loading reviews...</div>;
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-headline">What our patients say</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((review, i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-surface-variant shadow-sm">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, star) => (
                <Star key={star} className={`w-4 h-4 ${star < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-on-surface-variant text-sm mb-4 line-clamp-4">{review.text}</p>
            <p className="font-bold text-sm">{review.author_name}</p>
            <p className="text-xs text-on-surface-variant">{review.relative_time_description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
