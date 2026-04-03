import asyncHandler from 'express-async-handler';
import * as reviewService from '../services/reviewService.js';

export const getCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getCourseReviews(req.params.courseId);

  res.json({
    success: true,
    data: reviews,
  });
});

export const getMyReviewForCourse = asyncHandler(async (req, res) => {
  const review = await reviewService.getMyReviewForCourse(
    req.user._id,
    req.params.courseId
  );

  res.json({
    success: true,
    data: review || null,
  });
});

export const createOrUpdateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createOrUpdateReview(
    req.user._id,
    req.params.courseId,
    req.body
  );

  res.json({
    success: true,
    data: review,
    message: 'Đánh giá khoá học thành công',
  });
});
