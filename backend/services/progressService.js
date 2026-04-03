import LessonProgress from '../models/LessonProgress.js';
import Enrollment from '../models/Enrollment.js';

export const updateVideoProgress = async (userId, courseId, lessonId, percent) => {
  let progress = await LessonProgress.findOne({
    student: userId,
    lesson: lessonId,
  });

  if (!progress) {
    progress = await LessonProgress.create({
      student: userId,
      course: courseId,
      lesson: lessonId,
    });
  }

  progress.videoPercent = percent;

  if (percent >= 80) {
    progress.isVideoCompleted = true;
  }

  await evaluateCompletion(progress);
  return progress;
};

export const updateTextProgress = async (userId, courseId, lessonId, seconds) => {
  let progress = await LessonProgress.findOne({
    student: userId,
    lesson: lessonId,
  });

  if (!progress) {
    progress = await LessonProgress.create({
      student: userId,
      course: courseId,
      lesson: lessonId,
    });
  }

  progress.textReadSeconds = seconds;

  if (seconds >= 10) {
    progress.isTextCompleted = true;
  }

  await evaluateCompletion(progress);
  return progress;
};

const evaluateCompletion = async (progress) => {
  const hasVideo = progress.videoPercent > 0;
  const hasText = progress.textReadSeconds > 0;

  if (hasVideo && hasText) {
    progress.isCompleted = progress.isVideoCompleted && progress.isTextCompleted;
  } else if (hasVideo) {
    progress.isCompleted = progress.isVideoCompleted;
  } else {
    progress.isCompleted = progress.isTextCompleted;
  }

  if (progress.isCompleted) {
    progress.completedAt = new Date();
  }

  await progress.save();

  // update enrollment %
  await updateCourseProgress(progress.student, progress.course);
};

const updateCourseProgress = async (userId, courseId) => {
  const total = await LessonProgress.countDocuments({ course: courseId });
  const done = await LessonProgress.countDocuments({
    course: courseId,
    student: userId,
    isCompleted: true,
  });

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  await Enrollment.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      progress: percent,
      isCompleted: percent === 100,
    }
  );
};