import LessonProgress from '../models/LessonProgress.js';
import Enrollment from '../models/Enrollment.js';
import mongoose from 'mongoose';

/**
 * Progress Repository — raw DB access, no business logic
 */

// ── LessonProgress ────────────────────────────────────────────────────────────

export const findProgress = (student, course, lesson) =>
  LessonProgress.findOne({ student, course, lesson });

export const createProgress = (student, course, lesson) =>
  LessonProgress.create({ student, course, lesson });

export const findProgressByCourse = (student, course) =>
  LessonProgress.find({ student, course });

export const countCompletedLessons = (student, course) =>
  LessonProgress.countDocuments({ student, course, isCompleted: true });

export const saveProgress = (progress) => progress.save();

// ── Lesson (raw collection — dùng để đọc field snake_case từ DB) ──────────────

export const findLessonRaw = (lessonId) => {
  const col = mongoose.connection.db.collection('lessons');
  return col.findOne({ _id: new mongoose.Types.ObjectId(lessonId) });
};

export const countPublishedLessons = (courseId) => {
  const col = mongoose.connection.db.collection('lessons');
  return col.countDocuments({
    course: new mongoose.Types.ObjectId(courseId),
    isPublished: true,
  });
};

// ── Enrollment ────────────────────────────────────────────────────────────────

export const updateEnrollment = (userId, courseId, data) =>
  Enrollment.findOneAndUpdate(
    { user: userId, course: courseId },
    data,
    { new: true }
  );
