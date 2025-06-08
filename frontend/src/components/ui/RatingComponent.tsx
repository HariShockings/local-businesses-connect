import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'react-toastify';

interface RatingComponentProps {
  businessId: string;
  onReviewSubmit?: () => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ businessId, onReviewSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters for your review');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`http://localhost:5000/api/businesses/${businessId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setRating(0);
        setComment('');
        setHoverRating(0);
        setIsOpen(false);
        onReviewSubmit?.();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoverRating(value);
  };

  const renderStars = (interactive = false) => {
    const displayRating = interactive ? (hoverRating || rating) : rating;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && handleStarClick(star)}
            onMouseEnter={() => interactive && handleStarHover(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
            disabled={!interactive}
          >
            <Star
              className={`h-6 w-6 ${
                star <= displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors duration-200 font-medium"
      >
        <Star className="h-4 w-4 mr-2" />
        Write a Review
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Write a Review</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setRating(0);
            setComment('');
            setHoverRating(0);
          }}
          className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors duration-200"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            {renderStars(true)}
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
              {rating > 0 && (
                <span>
                  {rating} out of 5 stars
                  {rating === 1 && ' - Poor'}
                  {rating === 2 && ' - Fair'}
                  {rating === 3 && ' - Good'}
                  {rating === 4 && ' - Very Good'}
                  {rating === 5 && ' - Excellent'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this business..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
            required
            minLength={10}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 10 characters ({comment.length}/10)
          </p>
        </div>

        {/* User Info Display */}
        {user && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Posting as</p>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setRating(0);
              setComment('');
              setHoverRating(0);
            }}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || rating === 0 || comment.trim().length < 10}
            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingComponent;