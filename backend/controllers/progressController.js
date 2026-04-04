import asyncHandler from 'express-async-handler';
import LessonProgress from '../models/LessonProgress.js';
import Enrollment from '../models/Enrollment.js';
import mongoose from 'mongoose';

const updateEnrollmentProgress = async (userId, courseId) => {
  const lessonsCollection = mongoose.connection.db.collection('lessons');

  // Đếm tất cả lessons của course (không lọc isPublished vì field có thể không tồn tại)
  const totalLessons = await lessonsCollection.countDocuments({
    course: new mongoose.Types.ObjectId(courseId),
  });

  const completedLessons = await LessonProgress.countDocuments({
    student: userId,
    course: courseId,
    isCompleted: true,
  });

  const progress =
  totalLessons === 0 ? 0 : Math.min(100, Math.round((completedLessons / totalLessons) * 100));

  await Enrollment.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      progress,
      isCompleted: progress === 100,
    }
  );
};

export const updateTextProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { textReadSeconds } = req.body;

  let progress = await LessonProgress.findOne({
    student: req.user._id,
    course: courseId,
    lesson: lessonId,
  });

  if (!progress) {
    progress = await LessonProgress.create({
      student: req.user._id,
      course: courseId,
      lesson: lessonId,
    });
  }

  progress.textReadSeconds = Math.max(progress.textReadSeconds || 0, textReadSeconds || 0);

  if (progress.textReadSeconds >= 10) {
    progress.isTextCompleted = true;
  }

  const lessonsCollection = mongoose.connection.db.collection('lessons');
  const lesson = await lessonsCollection.findOne({
    _id: new mongoose.Types.ObjectId(lessonId),
  });

  // DB lưu snake_case: video_url, text_content
  const hasVideo = !!(lesson?.video_url || lesson?.videoUrl);
  const hasText  = !!(lesson?.text_content || lesson?.textContent);
  const isQuiz   = lesson?.type === 'quiz';

  if (isQuiz) {
    // Quiz không complete qua text endpoint
    progress.isCompleted = false;
  } else if (hasVideo && hasText) {
    progress.isCompleted = progress.isVideoCompleted && progress.isTextCompleted;
  } else if (hasText) {
    progress.isCompleted = progress.isTextCompleted;
  } else if (hasVideo) {
    progress.isCompleted = progress.isVideoCompleted;
  } else {
    // Không có content → mark done
    progress.isCompleted = true;
  }

  if (progress.isCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
  }

  await progress.save();
  await updateEnrollmentProgress(req.user._id, courseId);

  res.json({
    success: true,
    data: progress,
  });
});

export const updateVideoProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { videoPercent } = req.body;

  let progress = await LessonProgress.findOne({
    student: req.user._id,
    course: courseId,
    lesson: lessonId,
  });

  if (!progress) {
    progress = await LessonProgress.create({
      student: req.user._id,
      course: courseId,
      lesson: lessonId,
    });
  }

  progress.videoPercent = Math.max(progress.videoPercent || 0, videoPercent || 0);

  if (progress.videoPercent >= 80) {
    progress.isVideoCompleted = true;
  }

  const lessonsCollection = mongoose.connection.db.collection('lessons');
  const lesson = await lessonsCollection.findOne({
    _id: new mongoose.Types.ObjectId(lessonId),
  });

  // DB lưu snake_case: video_url, text_content
  const hasVideo = !!(lesson?.video_url || lesson?.videoUrl);
  const hasText  = !!(lesson?.text_content || lesson?.textContent);
  const isQuiz   = lesson?.type === 'quiz';

  if (isQuiz) {
    progress.isCompleted = false; // quiz dùng endpoint riêng
  } else if (hasVideo && hasText) {
    progress.isCompleted = progress.isVideoCompleted && progress.isTextCompleted;
  } else if (hasVideo) {
    progress.isCompleted = progress.isVideoCompleted;
  } else if (hasText) {
    progress.isCompleted = progress.isTextCompleted;
  } else {
    progress.isCompleted = true;
  }

  if (progress.isCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
  }

  await progress.save();
  await updateEnrollmentProgress(req.user._id, courseId);

  res.json({
    success: true,
    data: progress,
  });
});
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const progresses = await LessonProgress.find({
    student: req.user._id,
    course: courseId,
  });

  res.json({
    success: true,
    data: progresses,
  });
});

// ── Quiz complete ─────────────────────────────────────────────────────────────
export const updateQuizProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  let progress = await LessonProgress.findOne({
    student: req.user._id,
    course: courseId,
    lesson: lessonId,
  });

  if (!progress) {
    progress = await LessonProgress.create({
      student: req.user._id,
      course: courseId,
      lesson: lessonId,
    });
  }

  progress.isCompleted = true;
  if (!progress.completedAt) progress.completedAt = new Date();
  await progress.save();
  await updateEnrollmentProgress(req.user._id, courseId);

  res.json({ success: true, data: progress });
});
