"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, User, Calendar, Trash2, X, CheckCircle, AlertTriangle, Loader2, Building2 } from "lucide-react";
import { useAuth, api } from "@/app/context/AuthContext";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  username: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    companyName?: string;
    role?: string;
  } | null;
}

interface JobReviewsProps {
  jobId: string;
}

export default function JobReviews({ jobId }: JobReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; reviewId: string | null }>({
    show: false,
    reviewId: null,
  });
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [jobId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/job/${jobId}`);
      
      setReviews(res.data);
      
      if (res.data.length > 0) {
        const avg = res.data.reduce((sum: number, r: Review) => sum + r.rating, 0) / res.data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/reviews", {
        jobId,
        ...formData,
      });

      // ✅ Reset form and hide it BEFORE showing success modal
      setShowForm(false);
      setFormData({ rating: 5, comment: "" });
      
      // ✅ Fetch reviews immediately to update the list
      await fetchReviews();
      
      // ✅ Then show success modal
      setSuccessModal({
        show: true,
        message: "Review submitted successfully!",
      });
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setErrorModal({
        show: true,
        message: err.response?.data?.message || "Failed to submit review. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setDeleteModal({ show: true, reviewId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.reviewId) return;

    setDeleting(true);
    try {
      await api.delete(`/reviews/${deleteModal.reviewId}`);
      
      setDeleteModal({ show: false, reviewId: null });
      setSuccessModal({
        show: true,
        message: "Review deleted successfully!",
      });
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      setDeleteModal({ show: false, reviewId: null });
      setErrorModal({
        show: true,
        message: "Failed to delete review. Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  // Helper function to get display name and company info
  const getReviewerInfo = (review: Review) => {
    if (!review.user || typeof review.user !== 'object') {
      return {
        displayName: review.username || 'Anonymous',
        companyName: null,
        isCompany: false,
      };
    }

    const isCompany = review.user.role === 'company';
    const displayName = isCompany 
      ? review.user.companyName || 'Company User'
      : `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || review.username || 'Anonymous';

    return {
      displayName,
      companyName: isCompany ? review.user.companyName : null,
      isCompany,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-amber-500 w-6 h-6" />
        </div>
      </div>
    );
  }

  // ✅ Check if user has reviewed
  const userHasReviewed = user ? reviews.some((r) => {
    const reviewUserId = typeof r.user === 'object' && r.user !== null ? r.user._id : r.user;
    return reviewUserId === user._id;
  }) : false;

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {renderStars(averageRating, 20)}
                <span className="text-base sm:text-lg font-semibold text-gray-700">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          {/* ✅ Only show "Write a Review" button if user is logged in AND hasn't reviewed yet */}
          {user && !userHasReviewed && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm sm:text-base"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* ✅ Only show review form if user hasn't reviewed yet */}
        {showForm && !userHasReviewed && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmit}
            className="mb-6 p-4 border border-gray-200 rounded-lg"
          >
            <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
              Write Your Review
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        rating <= formData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 hover:text-amber-200"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                required
                rows={4}
                placeholder="Share your experience with this job..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 sm:px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="px-4 sm:px-6 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => {
              const reviewerInfo = getReviewerInfo(review);
              const reviewUserId = typeof review.user === 'object' && review.user !== null 
                ? review.user._id 
                : review.user;

              return (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 ${
                        reviewerInfo.isCompany ? 'bg-blue-100' : 'bg-amber-100'
                      }`}>
                        {review.user && typeof review.user === 'object' && review.user.profileImage ? (
                          <img
                            src={review.user.profileImage}
                            alt={reviewerInfo.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : reviewerInfo.isCompany ? (
                          <Building2 className="text-blue-600" size={16} />
                        ) : (
                          <User className="text-amber-600" size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {reviewerInfo.displayName}
                          </h4>
                          {reviewerInfo.isCompany && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <Building2 size={10} />
                              Company
                            </span>
                          )}
                        </div>
                        {renderStars(review.rating, 14)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span className="hidden sm:inline">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <span className="sm:hidden">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      {user && reviewUserId === user._id && (
                        <button
                          onClick={() => handleDeleteClick(review._id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mt-2 text-sm sm:text-base break-words">
                    {review.comment}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !deleting && setDeleteModal({ show: false, reviewId: null })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Review</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, reviewId: null })}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSuccessModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Success</h3>
              </div>

              <p className="text-gray-600 mb-6">{successModal.message}</p>

              <button
                onClick={() => setSuccessModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setErrorModal({ show: false, message: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <X className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Error</h3>
              </div>

              <p className="text-gray-600 mb-6">{errorModal.message}</p>

              <button
                onClick={() => setErrorModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}