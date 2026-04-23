import { useEffect, useState } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`w-7 h-7 ${star <= value ? 'text-amber-400' : 'text-slate-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewItem({ review }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user?.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              review.user?.name?.charAt(0) || 'U'
            )}
          </div>

          <div>
            <p className="text-white font-semibold text-sm">{review.user?.name || 'Học viên'}</p>
            <p className="text-xs text-slate-500">
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400' : 'text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export default function CourseReviewSection({ courseId, enrolled, onReviewSubmitted }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await reviewAPI.getCourseReviews(courseId);
      setReviews(res.data.data || []);
    } catch {
      setReviews([]);
    }
  };

  const loadMyReview = async () => {
    if (!user || user.role !== 'student' || !enrolled) return;

    try {
      const res = await reviewAPI.getMyReview(courseId);
      const data = res.data.data;
      setMyReview(data);

      if (!data) {
        setRating(5);
        setComment('');
      }
    } catch {
      setMyReview(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadReviews(), loadMyReview()]);
      setLoading(false);
    };

    init();
  }, [courseId, enrolled, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await reviewAPI.createOrUpdate(courseId, { rating, comment });
      toast.success('Gửi đánh giá thành công');

      await Promise.all([loadReviews(), loadMyReview()]);
      onReviewSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reviews" className="space-y-6">
      {user?.role === 'student' && enrolled && !myReview && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⭐</span>
            Đánh giá khoá học
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Số sao</p>
              <StarInput value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Nhận xét</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Chia sẻ cảm nhận của bạn về khoá học..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">{comment.length}/1000 ký tự</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>
      )}

      {user?.role === 'student' && enrolled && myReview && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>✅</span>
            Bạn đã đánh giá khoá học này
          </h2>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i <= myReview.rating ? 'text-amber-400' : 'text-slate-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {myReview.comment && (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {myReview.comment}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-3">
            Bạn chỉ có thể đánh giá 1 lần cho mỗi khoá học.
          </p>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💬</span> Đánh giá từ học viên
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            Chưa có đánh giá nào cho khoá học này.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}