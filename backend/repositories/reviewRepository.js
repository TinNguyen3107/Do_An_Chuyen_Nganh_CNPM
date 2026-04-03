import mongoose from 'mongoose';
import Review from '../models/Review.js';

export const findByUserAndCourse = (userId, courseId) =>
  Review.findOne({ user: userId, course: courseId }).populate('user', 'name avatar');

export const createReview = (data) => Review.create(data);

export const updateReview = (id, data) =>
  Review.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('user', 'name avatar');

export const findByCourse = (courseId) =>
  Review.find({ course: courseId }).populate('user', 'name avatar').sort({ createdAt: -1 });

export const getCourseRatingStats = async (courseId) => {
  const result = await Review.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { averageRating: 0, totalReviews: 0 };
};
